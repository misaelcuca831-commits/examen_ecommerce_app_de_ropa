/**
 * FakeStore App - Arquitectura Modular JavaScript
 */

// ==========================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
const API_URL = 'https://fakestoreapi.com/products';

const state = {
    products: [],
    filteredProducts: [],
    cart: []
};

// ==========================================
// 2. REFERENCIAS AL DOM
// ==========================================
const DOM = {
    productsGrid: document.getElementById('products-grid'),
    cartCount: document.getElementById('cart-count'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartToggle: document.getElementById('cart-toggle'),
    closeCartBtn: document.getElementById('close-cart'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartTotalElement: document.getElementById('cart-total'),
    checkoutBtn: document.getElementById('checkout-btn'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    sortFilter: document.getElementById('sort-filter'),
    
    // Referencias al Modal de Producto
    productModal: document.getElementById('product-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    modalImg: document.getElementById('modal-img'),
    modalCategory: document.getElementById('modal-category'),
    modalTitle: document.getElementById('modal-title'),
    modalDescription: document.getElementById('modal-description'),
    modalRating: document.getElementById('modal-rating'),
    modalPrice: document.getElementById('modal-price'),
    modalAddBtn: document.getElementById('modal-add-btn'),

    // Referencias para la Simulación de Descuento
    discountInput: document.getElementById('discount-input'),
    cartDiscountedTotalElement: document.getElementById('cart-discounted-total')
};

// ==========================================
// 3. CAPA DE PERSISTENCIA (LOCALSTORAGE)
// ==========================================
const StorageService = {
    KEY: 'fakestore_cart',
    
    save(cartData) {
        localStorage.setItem(this.KEY, JSON.stringify(cartData));
    },
    
    load() {
        const data = localStorage.getItem(this.KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error parseando LocalStorage:', error);
            return [];
        }
    },
    
    clear() {
        localStorage.removeItem(this.KEY);
    }
};

// ==========================================
// 4. CAPA DE SERVICIOS (API)
// ==========================================
async function fetchProductsFromAPI() {
    try {
        DOM.productsGrid.innerHTML = '<p class="loading">Cargando productos...</p>';
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Respuesta HTTP no satisfactoria');
        
        state.products = await response.json();
        state.filteredProducts = [...state.products];
        
        UIRenderer.populateCategories(state.products);
        UIRenderer.renderProducts(state.filteredProducts);
    } catch (error) {
        console.error('Error al consumir la API:', error);
        DOM.productsGrid.innerHTML = '<p class="error">Ocurrió un error al cargar los productos.</p>';
    }
}

// ==========================================
// 5. CAPA DE PRESENTACIÓN (RENDERIZADO UI)
// ==========================================
const UIRenderer = {
    populateCategories(products) {
        const categories = ['all', ...new Set(products.map(p => p.category))];
        DOM.categoryFilter.innerHTML = categories.map(cat => `
            <option value="${cat}">${cat === 'all' ? 'Todas las categorías' : cat.toUpperCase()}</option>
        `).join('');
    },

    renderProducts(products) {
        DOM.productsGrid.innerHTML = '';

        if (products.length === 0) {
            DOM.productsGrid.innerHTML = '<p class="no-results">No se encontraron productos coincidentes.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card';

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title" title="${product.title}">${product.title}</h3>
                    
                    <p class="product-description" title="${product.description}">${product.description}</p>
                    
                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating.rate} (${product.rating.count})</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <button class="btn-add-cart" data-id="${product.id}">
                            <i class="fa-solid fa-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            `;

            DOM.productsGrid.appendChild(card);
        });
    },

    renderCart(cart) {
        DOM.cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            DOM.cartItemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-qty">
                            <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                DOM.cartItemsContainer.appendChild(cartItem);
            });
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        DOM.cartCount.textContent = totalItems;
        DOM.cartTotalElement.textContent = totalPrice.toFixed(2);

        // Actualizar la simulación de descuento en tiempo real
        this.updateDiscountSimulation(totalPrice);
    },

    updateDiscountSimulation(totalPrice) {
        if (!DOM.discountInput || !DOM.cartDiscountedTotalElement) return;

        let discountPercent = parseFloat(DOM.discountInput.value);

        // Validaciones: número válido entre 0 y 100
        if (isNaN(discountPercent) || discountPercent < 0) {
            discountPercent = 0;
        } else if (discountPercent > 100) {
            discountPercent = 100;
        }

        const discountAmount = (totalPrice * discountPercent) / 100;
        const finalTotal = totalPrice - discountAmount;

        DOM.cartDiscountedTotalElement.textContent = finalTotal.toFixed(2);
    },

    openModal(productId) {
        const product = state.products.find(p => p.id === parseInt(productId, 10));
        if (!product) return;

        DOM.modalImg.src = product.image;
        DOM.modalImg.alt = product.title;
        DOM.modalCategory.textContent = product.category.toUpperCase();
        DOM.modalTitle.textContent = product.title;
        DOM.modalDescription.textContent = product.description;
        DOM.modalRating.innerHTML = `<i class="fa-solid fa-star"></i> <span>${product.rating.rate} (${product.rating.count})</span>`;
        DOM.modalPrice.textContent = `$${product.price.toFixed(2)}`;
        DOM.modalAddBtn.setAttribute('data-id', product.id);

        DOM.productModal.classList.add('active');
    },

    closeModal() {
        DOM.productModal.classList.remove('active');
    }
};

// ==========================================
// 6. LÓGICA DE NEGOCIO Y MANEJADORES DE EVENTOS
// ==========================================
const CartLogic = {
    add(productId) {
        const id = parseInt(productId, 10);
        const product = state.products.find(p => p.id === id);
        if (!product) return;

        const existing = state.cart.find(i => i.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }

        StorageService.save(state.cart);
        UIRenderer.renderCart(state.cart);
    },

    updateQuantity(productId, delta) {
        const item = state.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.remove(productId);
        } else {
            StorageService.save(state.cart);
            UIRenderer.renderCart(state.cart);
        }
    },

    remove(productId) {
        state.cart = state.cart.filter(i => i.id !== productId);
        StorageService.save(state.cart);
        UIRenderer.renderCart(state.cart);
    },

    clear() {
        state.cart = [];
        StorageService.clear();
        UIRenderer.renderCart(state.cart);
    }
};

function handleFilterAndSort() {
    const query = DOM.searchInput.value.toLowerCase().trim();
    const category = DOM.categoryFilter.value;
    const sort = DOM.sortFilter.value;

    state.filteredProducts = state.products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(query) || 
                            product.description.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    if (sort === 'price-asc') {
        state.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
        state.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
        state.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'name-desc') {
        state.filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
    }

    UIRenderer.renderProducts(state.filteredProducts);
}

// ==========================================
// 7. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
function initApp() {
    fetchProductsFromAPI();
    
    state.cart = StorageService.load();
    UIRenderer.renderCart(state.cart);

    // Búsqueda y Filtros
    DOM.searchInput.addEventListener('input', handleFilterAndSort);
    DOM.categoryFilter.addEventListener('change', handleFilterAndSort);
    DOM.sortFilter.addEventListener('change', handleFilterAndSort);

    // Simulación de descuento en tiempo real
    if (DOM.discountInput) {
        DOM.discountInput.addEventListener('input', () => {
            const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            UIRenderer.updateDiscountSimulation(totalPrice);
        });
    }

    // Controles de Sidebar
    DOM.cartToggle.addEventListener('click', () => DOM.cartSidebar.classList.add('active'));
    DOM.closeCartBtn.addEventListener('click', () => DOM.cartSidebar.classList.remove('active'));

    // Controles del Modal de Producto
    DOM.closeModalBtn.addEventListener('click', UIRenderer.closeModal);
    DOM.productModal.addEventListener('click', (e) => {
        if (e.target === DOM.productModal) UIRenderer.closeModal();
    });

    // Agregar al carrito desde el Modal
    DOM.modalAddBtn.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        const productId = btn.getAttribute('data-id');
        CartLogic.add(productId);
        UIRenderer.closeModal();
        DOM.cartSidebar.classList.add('active');
    });

    // Checkout
    if (DOM.checkoutBtn) {
        DOM.checkoutBtn.addEventListener('click', () => {
            if (state.cart.length === 0) {
                alert('El carrito está vacío');
                return;
            }
            alert('¡Gracias por tu compra!');
            CartLogic.clear();
            DOM.cartSidebar.classList.remove('active');
        });
    }

    // Delegación de eventos en la grilla para abrir modal o agregar al carrito
    DOM.productsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-cart');
        const card = e.target.closest('.product-card');

        if (btn) {
            CartLogic.add(btn.getAttribute('data-id'));
            DOM.cartSidebar.classList.add('active');
        } else if (card) {
            const cardAddBtn = card.querySelector('.btn-add-cart');
            if (cardAddBtn) {
                const productId = cardAddBtn.getAttribute('data-id');
                UIRenderer.openModal(productId);
            }
        }
    });

    // Delegación de eventos dentro del carrito para agregar el descuento.
    DOM.cartItemsContainer.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.qty-btn');
        if (qtyBtn) {
            const id = parseInt(qtyBtn.getAttribute('data-id'), 10);
            const action = qtyBtn.getAttribute('data-action');
            CartLogic.updateQuantity(id, action === 'increase' ? 1 : -1);
            return;
        }

        const removeBtn = e.target.closest('.remove-item-btn');
        if (removeBtn) {
            const id = parseInt(removeBtn.getAttribute('data-id'), 10);
            CartLogic.remove(id);
        }
    });
}
    

document.addEventListener('DOMContentLoaded', initApp);
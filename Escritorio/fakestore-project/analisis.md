# 📐 Análisis de Diseño, Arquitectura y Usabilidad - FakeStore App

Este documento detalla las decisiones técnicas, de interfaz de usuario (UI), experiencia de usuario (UX) y arquitectura de datos implementadas en el proyecto **FakeStore App**.

---

## 1. 🎨 Decisiones de Diseño UI/UX

* **Layout Limpio y Moderno:** Se optó por una estructura tipo e-commerce minimalista con paleta de colores de alto contraste (`#1e293b` azul noche, `#2563eb` azul primario, `#f4f6f8` fondo claro y `#ef4444` acentos de alerta/acción).
* **Grid Adaptativo:** La sección de productos utiliza **CSS Grid** (`repeat(auto-fill, minmax(260px, 1fr))`), asegurando que las tarjetas se reordenen de forma fluida según el ancho del dispositivo sin romper la cuadrícula.
* **Carrito Lateral Accesible (Sidebar):** El carrito se diseñó como un panel deslizante fijo (*fixed sidebar*). Permite al usuario revisar su compra de forma inmediata desde cualquier punto de la navegación sin perder la vista de la tienda.
* **Feedback Visual e Interacción:** Transiciones suaves (`hover`) en tarjetas y botones, badges interactivos para el conteo de ítems e indicadores de carga y estado vacío.

---

## 2. 🗄️ Estructura de Datos Usada

### A. Productos (`state.products` y `state.filteredProducts`)
* **Representación:** Arreglo de objetos JavaScript obtenido desde la FakeStore API.
* **Estructura de un producto:**
  \`\`\`json
  {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack",
    "price": 109.95,
    "category": "men's clothing",
    "description": "Your perfect pack for everyday use...",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    "rating": { "rate": 3.9, "count": 120 }
  }
  \`\`\`

### B. Carrito de Compras (`state.cart`)
* **Representación:** Arreglo de objetos JavaScript que extienden las propiedades del producto agregando la propiedad `quantity`.
* **Estructura de un ítem del carrito:**
  \`\`\`json
  {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack",
    "price": 109.95,
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    "quantity": 2
  }
  \`\`\`

### C. Persistencia (`localStorage`)
* **Representación:** Cadena JSON (`JSON.stringify`) guardada bajo la clave `'fakestore_cart'`. Permite recuperar y reconstruir la memoria del carrito al recargar o reabrir el navegador.

---

## 3. 🎯 Justificación de Filtros y Ordenamientos

* **Búsqueda en Tiempo Real (Evento \`input\`):** Permite al usuario encontrar productos rápidamente escribiendo palabras clave del título o descripción, reduciendo la carga cognitiva y acelerando el proceso de compra.
* **Filtro por Categoría (Evento \`change\`):** Se puebla de forma dinámica leyendo las categorías únicas presentes en la API. Facilita la navegación por segmentos de interés sin saturar al usuario con opciones irrelevantes.
* **Ordenamiento por Precio y Nombre (Evento \`change\`):**
  * *Precio Menor a Mayor / Mayor a Menor:* Crucial para usuarios con presupuesto específico o enfocados en ofertas.
  * *Nombre A-Z / Z-A:* Facilita la localización alfabética dentro de catálogos extensos.

---

## 4. 🖼️ Wireframes y Bocetos
Los bocetos e ideas iniciales de maquetación se encuentran ubicados en la carpeta:
\`docs/wireframes/\`

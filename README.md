# Tienda Catalina - E-commerce Vanilla JS

Este es un proyecto base de e-commerce minimalista y elegante para ropa de mujer, construido sin frameworks usando únicamente **HTML5, CSS y JavaScript Vanilla**.

## Estructura del Proyecto

```text
/proyecto-mama
│
├── index.html          # Estructura de la aplicación
├── README.md           # Este archivo
├── css/
│   └── style.css       # Estilos (Minimalista y elegante)
├── images/
│   └── .keep           # Carpeta para colocar las imágenes de tus productos
└── js/
    ├── products.js     # Datos de los productos
    ├── cart.js         # Lógica del carrito, LocalStorage y WhatsApp
    └── main.js         # Lógica de Interfaz de Usuario (DOM)
```

## 1. Organización de los productos en JavaScript (`js/products.js`)
Para evitar bases de datos complejas en esta etapa, usamos en `js/products.js` un arreglo global de objetos llamado `products`.
Cada objeto representa un producto e incluye:
* `id`: Identificador único (importante para el carrito).
* `name`: Nombre del producto.
* `price`: Precio en número.
* `image`: Ruta a la imagen guardada en `/images/`. (Ej: `"images/vestido.jpg"`)
* `description`: Una descripción breve.
* `sizes`: Un arreglo con los talles disponibles. Si está vacío `[]`, no pedirá talle.

## 2. Manejo del Carrito con LocalStorage (`js/cart.js`)
`LocalStorage` permite guardar datos en el navegador del usuario incluso si recarga o cierra la página.
- **Leer carrito**: Al iniciar, `JSON.parse(localStorage.getItem('catalina_cart'))` recupera los datos. Si no hay, crea un arreglo vacío `[]`.
- **Escribir carrito**: Cada vez que se añade (`addToCart`), remueve (`removeFromCart`) o modifica una cantidad (`updateQuantity`), llamamos a `saveCart()` que usa `localStorage.setItem('catalina_cart', JSON.stringify(cart))` para guardar el estado actualizado del carrito en formato JSON.

## 3. Construcción del mensaje de WhatsApp (`js/cart.js -> checkoutWhatsApp()`)
El flujo de checkout no usa pasarelas de pago, sino que delega la confirmación de la venta a través de WhatsApp.
- Se recorre el `cart` item por item, extrayendo nombre, cantidad, talle (si lo tiene) y calculando el subtotal.
- Todo esto se guarda en un string multilinea (variable `message`).
- Se utiliza la función nativa `encodeURIComponent()` de JavaScript para transformar el texto a formato de URL segura (cambiando los espacios por `%20` y saltos de línea donde corresponda).
- Por último, se arma el enlace de redirección `https://wa.me/NÚMERO?text=MENSAJE` y se usa `window.open` para abrirlo en una nueva pestaña.

> **Importante:** Recuerda abrir `js/cart.js` y editar el valor de la variable `phoneNumber` de la línea 79 con el número de teléfono donde quieres recibir los pedidos.

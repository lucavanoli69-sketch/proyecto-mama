/**
 * Cart Logic using LocalStorage
 */

// Inicializar el carrito vacío o desde el LocalStorage
let cart = JSON.parse(localStorage.getItem('catalina_cart')) || [];

/**
 * Guarda el carrito actual en LocalStorage
 */
function saveCart() {
    localStorage.setItem('catalina_cart', JSON.stringify(cart));
}

/**
 * Agrega un producto al carrito
 * @param {number} productId 
 * @param {string} size - Talle seleccionado (si aplica)
 */
function addToCart(productId, size = null) {
    // Buscar si el producto ya existe con ese mismo talle
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const productData = products.find(p => p.id === productId);
        if(productData) {
            cart.push({
                ...productData,
                size: size,
                quantity: 1
            });
        }
    }
    
    saveCart();
    renderCart(); // Esta función vendrá definida en main.js
}

/**
 * Cambia la cantidad de un item
 */
function updateQuantity(cartIndex, change) {
    if (cart[cartIndex]) {
        cart[cartIndex].quantity += change;
        
        // Si baja a 0 o menos, lo eliminamos
        if (cart[cartIndex].quantity <= 0) {
            removeFromCart(cartIndex);
            return;
        }
        
        saveCart();
        renderCart();
    }
}

/**
 * Elimina un producto por su índice en el array del carrito
 */
function removeFromCart(cartIndex) {
    cart.splice(cartIndex, 1);
    saveCart();
    renderCart();
}

/**
 * Vacía el carrito por completo
 */
function emptyCart() {
    cart = [];
    saveCart();
    renderCart();
}

/**
 * Calcula el número total de artículos
 */
function getCartItemsCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calcula el precio total del carrito
 */
function getCartTotalPrice() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Número de WhatsApp solo dígitos: código país + número sin + ni espacios.
 * Uruguay: 598 + celular sin el 0 inicial (ej. 098 052 646 → 59898052646).
 * Cambiá este valor si usás otro número.
 */
const WHATSAPP_BUSINESS_NUMBER = '59898052646';

/**
 * Genera el mensaje de WhatsApp y redirige
 */
function checkoutWhatsApp() {
    const cartData = JSON.parse(localStorage.getItem('catalina_cart')) || [];

    if (cartData.length === 0) {
        alert('Tu carrito está vacío. Agregá productos antes de finalizar la compra.');
        return;
    }

    let message = 'Hola, quiero comprar:\n\n';

    cartData.forEach((item) => {
        const talle = item.size ? ` (Talle ${item.size})` : '';
        const lineTotal = formatPrice(item.price * item.quantity);
        message += `- ${item.name}${talle} x${item.quantity} - ${lineTotal}\n`;
    });

    const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\nTotal: ${formatPrice(total)}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

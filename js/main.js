/**
 * Main UI Logic
 * Interacts with DOM elements and cart.js / products.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // Cart DOM Elements
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const openCartFooterBtn = document.getElementById('open-cart-footer');
    const openCartFooter2Btn = document.getElementById('open-cart-footer-2');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const emptyCartBtn = document.getElementById('empty-cart-btn');

    // Product Category Containers
    const ropaContainer = document.getElementById('ropa-container');
    const accesoriosContainer = document.getElementById('accesorios-container');
    const featuredContainer = document.getElementById('featured-container');

    /**
     * Reusable logic to create a product card element safely
     */
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Size Selector HTML
        let sizeSelectorHTML = '';
        if (product.sizes && product.sizes.length > 0) {
            const options = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
            sizeSelectorHTML = `
                <div class="size-selector">
                    <select id="size-${product.id}">
                        ${options}
                    </select>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                ${sizeSelectorHTML}
                <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})">
                    Agregar al carrito
                </button>
            </div>
        `;
        return card;
    }

    /**
     * Renders products to their respective grids
     */
    function renderProducts() {
        // Render in Shop Page categories
        if (ropaContainer || accesoriosContainer) {
            products.forEach(product => {
                const card = createProductCard(product);
                if (product.category === 'ropa' && ropaContainer) {
                    ropaContainer.appendChild(card);
                } else if (product.category === 'accesorios' && accesoriosContainer) {
                    accesoriosContainer.appendChild(card);
                }
            });
        }

        // Render in Index Page (Featured Section)
        if (featuredContainer) {
            // Mostrar los primeros 3 o 4 (en este caso tomamos 3 como destacado ideal)
            const featuredProducts = products.slice(0, 3);
            featuredProducts.forEach(product => {
                const card = createProductCard(product);
                featuredContainer.appendChild(card);
            });
        }
    }

    /**
     * Handles add to cart button click
     */
    window.handleAddToCart = function(productId) {
        const productData = products.find(p => p.id === productId);
        let selectedSize = null;

        if (productData && productData.sizes && productData.sizes.length > 0) {
            const sizeSelect = document.getElementById(`size-${productId}`);
            if (sizeSelect) {
                selectedSize = sizeSelect.value;
            }
        }

        addToCart(productId, selectedSize);
        openCart(); // Abrir carrito al agregar
    };

    /**
     * Toggles cart sidebar
     */
    function openCart() {
        if(cartOverlay) {
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if(cartOverlay) {
            cartOverlay.classList.remove('active');
            document.body.style.overflow = ''; 
        }
    }

    if(openCartBtn) openCartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    if(openCartFooterBtn) openCartFooterBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    if(openCartFooter2Btn) openCartFooter2Btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

    // Close on click outside
    if(cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeCart();
        });
    }

    /**
     * Renders items inside the cart
     */
    window.renderCart = function() {
        if(!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        const currentCartCount = getCartItemsCount();
        
        if(cartBadge) cartBadge.textContent = currentCartCount;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu bolsa está vacía.</p>';
            if(cartTotalPrice) cartTotalPrice.textContent = '$0';
            if(checkoutBtn) {
                checkoutBtn.style.opacity = '0.5';
                checkoutBtn.style.pointerEvents = 'none';
            }
            return;
        }

        if(checkoutBtn) {
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.pointerEvents = 'auto';
        }

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const sizeText = item.size ? `<span class="cart-item-size">Talle: ${item.size}</span>` : '';

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x120'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    ${sizeText}
                    
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">Eliminar</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        if(cartTotalPrice) cartTotalPrice.textContent = formatPrice(getCartTotalPrice());
    };

    if(checkoutBtn) checkoutBtn.addEventListener('click', checkoutWhatsApp);
    if(emptyCartBtn) emptyCartBtn.addEventListener('click', emptyCart);

    // Initial render
    renderProducts();
    renderCart();
});

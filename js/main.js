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
            if (product.sizes.length === 1) {
                sizeSelectorHTML = `<p class="size-single">Talle único</p>`;
            } else {
                const options = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
                sizeSelectorHTML = `
                    <div class="size-selector">
                        <select id="size-${product.id}">
                            ${options}
                        </select>
                    </div>
                `;
            }
        }

        let imageHTML = `<img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=${encodeURIComponent(product.name)}'">`;
        if (product.hoverImage) {
            imageHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image main-img" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=${encodeURIComponent(product.name)}'">
                <img src="${product.hoverImage}" alt="${product.name} hover" class="product-image hover-img" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=${encodeURIComponent(product.name)}'">
            `;
        }

        let buttonHTML = `
            <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})">
                Agregar al carrito
            </button>
        `;
        if (product.stock === 0) {
            buttonHTML = `
                <button class="add-to-cart-btn disabled" disabled>
                    Sin stock
                </button>
            `;
        }

        card.innerHTML = `
            <div class="product-image-container" onclick="openProductModal(${product.id})" style="cursor:pointer;">
                ${imageHTML}
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="openProductModal(${product.id})" style="cursor:pointer;" title="Ver detalles">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                ${sizeSelectorHTML}
                ${buttonHTML}
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

    // Modal Injection & Logic
    function injectModal() {
        const modalHTML = `
            <div class="modal-overlay" id="product-modal">
                <div class="modal-content">
                    <button class="close-modal-btn" id="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
                    <div class="modal-body" id="modal-body-container">
                        <!-- JS Content -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalDiv = document.getElementById('product-modal');
        const closeBtn = document.getElementById('close-modal-btn');
        
        closeBtn.addEventListener('click', () => {
            modalDiv.classList.remove('active');
            document.body.style.overflow = '';
        });

        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
                modalDiv.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    injectModal();

    window.changeModalImage = function(src) {
        const mainImg = document.getElementById('modal-main-image');
        if (mainImg) mainImg.src = src;
    };

    window.handleAddToCartModal = function(productId) {
        const productData = products.find(p => p.id === productId);
        let selectedSize = null;

        if (productData && productData.sizes && productData.sizes.length > 0) {
            if (productData.sizes.length > 1) {
                const sizeSelect = document.getElementById(`modal-size-${productId}`);
                if (sizeSelect) selectedSize = sizeSelect.value;
            } else {
                 selectedSize = productData.sizes[0];
            }
        }

        addToCart(productId, selectedSize);
        document.getElementById('product-modal').classList.remove('active');
        openCart();
    };

    window.openProductModal = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modalDiv = document.getElementById('product-modal');
        const modalContainer = document.getElementById('modal-body-container');
        
        // Gallery or single image
        let galleryHTML = '';
        if (product.gallery && product.gallery.length > 0) {
            const thumbnails = product.gallery.map(img => `
                <div class="thumbnail-wrapper" onclick="changeModalImage('${img}')">
                    <img src="${img}" alt="Thumbnail" class="modal-thumbnail" loading="lazy" onerror="this.src='https://placehold.co/100x100?text=Error'">
                </div>
            `).join('');
            galleryHTML = `
                <div class="modal-gallery-container">
                    <div class="modal-main-img-container">
                        <img src="${product.gallery[0]}" id="modal-main-image" class="modal-main-image" alt="${product.name}" onerror="this.src='https://placehold.co/500x600?text=${encodeURIComponent(product.name)}'">
                    </div>
                    <div class="modal-thumbnails">
                        ${thumbnails}
                    </div>
                </div>
            `;
        } else {
            galleryHTML = `
                <div class="modal-gallery-container has-single-image">
                    <div class="modal-main-img-container">
                        <img src="${product.image}" id="modal-main-image" class="modal-main-image" alt="${product.name}" onerror="this.src='https://placehold.co/500x600?text=${encodeURIComponent(product.name)}'">
                    </div>
                </div>
            `;
        }

        // Features
        let featuresHTML = '';
        if (product.features && product.features.length > 0) {
            const items = product.features.map(f => `<li>${f}</li>`).join('');
            featuresHTML = `
                <ul class="modal-features">
                    ${items}
                </ul>
            `;
        }

        // Size
        let sizeSelectorHTML = '';
        if (product.sizes && product.sizes.length > 0) {
            if (product.sizes.length === 1) {
                sizeSelectorHTML = `<p class="size-single-modal">Talle: <strong>Único</strong></p>`;
            } else {
                const options = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
                sizeSelectorHTML = `
                    <div class="size-selector modal-size-selector">
                        <select id="modal-size-${product.id}">
                            ${options}
                        </select>
                    </div>
                `;
            }
        }

        // Button
        let buttonHTML = `<button class="add-to-cart-btn btn-modal" onclick="handleAddToCartModal(${product.id})">Agregar al carrito</button>`;
        if (product.stock === 0) {
            buttonHTML = `<button class="add-to-cart-btn btn-modal disabled" disabled>Sin stock</button>`;
        }

        modalContainer.innerHTML = `
            ${galleryHTML}
            <div class="modal-info-container">
                <h2 class="modal-title">${product.name}</h2>
                <div class="modal-price">${formatPrice(product.price)}</div>
                <p class="modal-desc">${product.description}</p>
                ${featuresHTML}
                <div class="modal-action-area">
                    ${sizeSelectorHTML}
                    ${buttonHTML}
                </div>
            </div>
        `;

        modalDiv.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

});

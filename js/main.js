/**
 * Main UI Logic — carrito, productos y accesibilidad
 */

const PLACEHOLDER_PRODUCT_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23EDEAE3' width='400' height='500'/%3E%3C/svg%3E";

const PLACEHOLDER_CART_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='100' viewBox='0 0 80 100'%3E%3Crect fill='%23EDEAE3' width='80' height='100'/%3E%3C/svg%3E";

function productImageAlt(product) {
    const base = `${product.name} — ${product.description}`;
    return base.length > 140 ? `${base.slice(0, 137)}…` : base;
}

function buildProductPicture(product, loading, fetchPriority) {
    const wrap = document.createElement('div');
    wrap.className = 'product-image-container';

    const picture = document.createElement('picture');

    if (product.imageWebp) {
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = product.imageWebp;
        picture.appendChild(source);
    }

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = productImageAlt(product);
    img.className = 'product-image';
    img.loading = loading;
    img.decoding = 'async';
    img.width = 400;
    img.height = 500;
    if (fetchPriority) {
        img.fetchPriority = fetchPriority;
    }
    img.addEventListener('error', () => {
        img.src = PLACEHOLDER_PRODUCT_IMG;
        img.alt = `${product.name} — imagen no disponible`;
    }, { once: true });

    picture.appendChild(img);
    wrap.appendChild(picture);
    return wrap;
}

document.addEventListener('DOMContentLoaded', () => {
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

    const ropaContainer = document.getElementById('ropa-container');
    const accesoriosContainer = document.getElementById('accesorios-container');
    const featuredContainer = document.getElementById('featured-container');

    function setCartOverlayOpen(isOpen) {
        if (!cartOverlay) return;
        cartOverlay.classList.toggle('active', isOpen);
        cartOverlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (openCartBtn) {
            openCartBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function createProductCard(product, options) {
        const opts = options || {};
        const card = document.createElement('article');
        card.className = 'product-card';

        const loading = opts.priority ? 'eager' : 'lazy';
        const fetchPriority = opts.priority ? 'high' : undefined;
        card.appendChild(buildProductPicture(product, loading, fetchPriority));

        const info = document.createElement('div');
        info.className = 'product-info';

        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = product.name;

        const desc = document.createElement('p');
        desc.className = 'product-desc';
        desc.textContent = product.description;

        const priceEl = document.createElement('div');
        priceEl.className = 'product-price';
        priceEl.textContent = formatPrice(product.price);

        info.appendChild(title);
        info.appendChild(desc);
        info.appendChild(priceEl);

        if (product.sizes && product.sizes.length > 0) {
            const selWrap = document.createElement('div');
            selWrap.className = 'size-selector';
            const selId = `size-${product.id}`;
            const label = document.createElement('label');
            label.className = 'visually-hidden';
            label.setAttribute('for', selId);
            label.textContent = `Talle para ${product.name}`;
            const select = document.createElement('select');
            select.id = selId;
            product.sizes.forEach((size) => {
                const opt = document.createElement('option');
                opt.value = size;
                opt.textContent = size;
                select.appendChild(opt);
            });
            selWrap.appendChild(label);
            selWrap.appendChild(select);
            info.appendChild(selWrap);
        }

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'add-to-cart-btn';
        addBtn.dataset.productId = String(product.id);
        addBtn.textContent = 'Agregar al carrito';

        info.appendChild(addBtn);
        card.appendChild(info);
        return card;
    }

    function renderProducts() {
        if (ropaContainer || accesoriosContainer) {
            products.forEach((product) => {
                const card = createProductCard(product);
                if (product.category === 'ropa' && ropaContainer) {
                    ropaContainer.appendChild(card);
                } else if (product.category === 'accesorios' && accesoriosContainer) {
                    accesoriosContainer.appendChild(card);
                }
            });
        }

        if (featuredContainer) {
            const featuredProducts = products.slice(0, 3);
            featuredProducts.forEach((product, index) => {
                const card = createProductCard(product, { priority: index === 0 });
                featuredContainer.appendChild(card);
            });
        }
    }

    function getSelectedSize(productId) {
        const productData = products.find((p) => p.id === productId);
        if (!productData || !productData.sizes || productData.sizes.length === 0) {
            return null;
        }
        const sizeSelect = document.getElementById(`size-${productId}`);
        return sizeSelect ? sizeSelect.value : null;
    }

    function handleAddToCart(productId) {
        addToCart(productId, getSelectedSize(productId));
        openCart();
    }

    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (!addBtn || !addBtn.dataset.productId) return;
        e.preventDefault();
        const pid = Number.parseInt(addBtn.dataset.productId, 10);
        if (Number.isNaN(pid)) return;
        handleAddToCart(pid);
    });

    function openCart() {
        setCartOverlayOpen(true);
    }

    function closeCart() {
        setCartOverlayOpen(false);
    }

    if (openCartBtn) {
        openCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
    if (openCartFooterBtn) {
        openCartFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
    if (openCartFooter2Btn) {
        openCartFooter2Btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeCart();
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const dec = e.target.closest('[data-qty-dec]');
            const inc = e.target.closest('[data-qty-inc]');
            const rem = e.target.closest('[data-remove]');
            if (dec) {
                const idx = Number.parseInt(dec.getAttribute('data-qty-dec'), 10);
                updateQuantity(idx, -1);
            } else if (inc) {
                const idx = Number.parseInt(inc.getAttribute('data-qty-inc'), 10);
                updateQuantity(idx, 1);
            } else if (rem) {
                const idx = Number.parseInt(rem.getAttribute('data-remove'), 10);
                removeFromCart(idx);
            }
        });
    }

    window.renderCart = function renderCart() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        const currentCartCount = getCartItemsCount();

        if (cartBadge) cartBadge.textContent = currentCartCount;

        if (cart.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty-cart-msg';
            empty.textContent = 'Tu bolsa está vacía.';
            cartItemsContainer.appendChild(empty);
            if (cartTotalPrice) cartTotalPrice.textContent = formatPrice(0);
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        if (checkoutBtn) checkoutBtn.disabled = false;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = `${item.name} — en tu carrito`;
            img.className = 'cart-item-img';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.width = 80;
            img.height = 100;
            img.addEventListener('error', () => {
                img.src = PLACEHOLDER_CART_IMG;
            }, { once: true });

            const details = document.createElement('div');
            details.className = 'cart-item-details';

            const itemTitle = document.createElement('h3');
            itemTitle.className = 'cart-item-title';
            itemTitle.textContent = item.name;

            const priceLine = document.createElement('div');
            priceLine.className = 'cart-item-price';
            priceLine.textContent = formatPrice(item.price);

            details.appendChild(itemTitle);
            details.appendChild(priceLine);

            if (item.size) {
                const sizeSpan = document.createElement('span');
                sizeSpan.className = 'cart-item-size';
                sizeSpan.textContent = `Talle: ${item.size}`;
                details.appendChild(sizeSpan);
            }

            const actions = document.createElement('div');
            actions.className = 'cart-item-actions';

            const qtyWrap = document.createElement('div');
            qtyWrap.className = 'qty-controls';
            qtyWrap.setAttribute('role', 'group');
            qtyWrap.setAttribute('aria-label', `Cantidad de ${item.name}`);

            const btnDec = document.createElement('button');
            btnDec.type = 'button';
            btnDec.className = 'qty-btn';
            btnDec.setAttribute('data-qty-dec', String(index));
            btnDec.setAttribute('aria-label', `Disminuir cantidad de ${item.name}`);
            btnDec.textContent = '−';

            const qtyVal = document.createElement('span');
            qtyVal.className = 'qty-value';
            qtyVal.textContent = String(item.quantity);

            const btnInc = document.createElement('button');
            btnInc.type = 'button';
            btnInc.className = 'qty-btn';
            btnInc.setAttribute('data-qty-inc', String(index));
            btnInc.setAttribute('aria-label', `Aumentar cantidad de ${item.name}`);
            btnInc.textContent = '+';

            qtyWrap.appendChild(btnDec);
            qtyWrap.appendChild(qtyVal);
            qtyWrap.appendChild(btnInc);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-btn';
            removeBtn.setAttribute('data-remove', String(index));
            removeBtn.textContent = 'Eliminar';

            actions.appendChild(qtyWrap);
            actions.appendChild(removeBtn);
            details.appendChild(actions);

            cartItem.appendChild(img);
            cartItem.appendChild(details);
            cartItemsContainer.appendChild(cartItem);
        });

        if (cartTotalPrice) {
            cartTotalPrice.textContent = formatPrice(getCartTotalPrice());
        }
    };

    if (checkoutBtn) checkoutBtn.addEventListener('click', checkoutWhatsApp);
    if (emptyCartBtn) emptyCartBtn.addEventListener('click', emptyCart);

    renderProducts();
    renderCart();

    /* Editorial banner: revelado de imagen al scroll (overlay translateY) */
    const editorialBanner = document.querySelector('.editorial-banner');
    const editorialRevealOverlay = editorialBanner?.querySelector('.editorial-banner__reveal-overlay');
    let editorialRevealRaf = 0;

    function updateEditorialBannerReveal() {
        editorialRevealRaf = 0;
        if (!editorialBanner || !editorialRevealOverlay) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            editorialRevealOverlay.style.transform = 'translate3d(0, -100%, 0)';
            return;
        }
        const rect = editorialBanner.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const start = vh * 0.9;
        const end = Math.max(vh * 0.22, 100);
        let progress = (start - rect.top) / (start - end);
        progress = Math.max(0, Math.min(1, progress));
        editorialRevealOverlay.style.transform = `translate3d(0, ${-100 * progress}%, 0)`;
    }

    function requestEditorialBannerReveal() {
        if (editorialRevealRaf) return;
        editorialRevealRaf = requestAnimationFrame(updateEditorialBannerReveal);
    }

    if (editorialBanner && editorialRevealOverlay) {
        window.addEventListener('scroll', requestEditorialBannerReveal, { passive: true });
        window.addEventListener('resize', requestEditorialBannerReveal, { passive: true });
        updateEditorialBannerReveal();
    }
});

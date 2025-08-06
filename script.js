document.addEventListener('DOMContentLoaded', () => {

    // --- Product Database ---
    const productData = { "methiLadoo": { name: "Methi Ladoo", price: 800 }, "paushtikLadoo": { name: "Paushtik Ladoo", price: 900 }, "dryFruitLadoo": { name: "Dry Fruit Ladoo", price: 1000 } };

    // --- Core UI Functions ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => { if (mainNav && mainNav.classList.contains('active')) { mobileNavToggle.classList.remove('active'); mainNav.classList.remove('active'); } });
    });
    document.querySelectorAll('.flashcard').forEach(card => {
        card.addEventListener('click', (e) => { if (e.target.closest('button, a')) return; card.classList.toggle('flipped'); });
    });

    // --- NEW: Toast Notification Function ---
    let toastTimeout;
    const showToastNotification = (message) => {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.remove('hidden');

        // Clear any existing timer to reset the duration
        clearTimeout(toastTimeout);

        // Set a timer to hide the toast after 3 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    };

    // --- Shopping Cart Logic ---
    const getCart = () => JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const saveCart = (cart) => localStorage.setItem('shoppingCart', JSON.stringify(cart));

    const updateCartBanner = () => {
        const cart = getCart();
        const banner = document.getElementById('floating-cart-banner');
        const itemCountSpan = document.getElementById('cart-item-count');
        if (!banner || !itemCountSpan) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            itemCountSpan.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} in cart`;
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    };

    const addToCart = (productId, quantity) => {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity: quantity });
        }
        saveCart(cart);
        updateCartBanner();
        // Use the new toast notification instead of alert
        showToastNotification(`${quantity}kg of ${productData[productId].name} added to cart!`);
    };

    // Attach event listeners to all product elements
    document.querySelectorAll('[data-product-id]').forEach(productElement => {
        const productId = productElement.getAttribute('data-product-id');
        const quantitySpan = productElement.querySelector('.quantity');
        const minusBtn = productElement.querySelector('.quantity-minus');
        const plusBtn = productElement.querySelector('.quantity-plus');
        const addBtn = productElement.querySelector('.add-to-cart-btn');

        if (minusBtn) { minusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); if (q > 1) quantitySpan.textContent = q - 1; }); }
        if (plusBtn) { plusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); quantitySpan.textContent = q + 1; }); }
        if (addBtn) { addBtn.addEventListener('click', () => { const q = parseInt(quantitySpan.textContent); addToCart(productId, q); }); }
    });

    // --- Page Specific Logic ---
    
    // NEW: Smart Scrolling for Products Page
    if (document.querySelector('.product-list')) {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Use a timeout to ensure the page is fully rendered before scrolling
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }
    
    // Checkout Page Logic (no changes needed here)
    if (document.getElementById('checkout-page')) {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutSummary = document.getElementById('checkout-summary');
        const totalBillSpan = document.getElementById('total-bill-amount');
        const renderCartItems = () => {
            const cart = getCart();
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                emptyCartMessage.classList.remove('hidden');
                checkoutSummary.classList.add('hidden');
                return;
            }
            emptyCartMessage.classList.add('hidden');
            checkoutSummary.classList.remove('hidden');
            cart.forEach(item => {
                const product = productData[item.id];
                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                itemElement.setAttribute('data-product-id', item.id);
                itemElement.innerHTML = `<div class="item-info"><h4>${product.name}</h4><p>₹${product.price}/kg</p></div><div class="item-controls"><div class="quantity-control"><button class="quantity-minus">-</button><span class="quantity">${item.quantity}</span><button class="quantity-plus">+</button></div><button class="remove-item-btn">Remove</button></div>`;
                cartItemsContainer.appendChild(itemElement);
            });
            updateTotalBill();
            attachCheckoutEventListeners();
        };
        const updateTotalBill = () => {
            const cart = getCart();
            const total = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);
            totalBillSpan.textContent = `₹${total}`;
        };
        const updateCartItemQuantity = (productId, newQuantity) => {
            let cart = getCart();
            if (newQuantity <= 0) { cart = cart.filter(item => item.id !== productId); } 
            else { const item = cart.find(item => item.id === productId); if (item) item.quantity = newQuantity; }
            saveCart(cart);
            renderCartItems();
        };
        const attachCheckoutEventListeners = () => {
            document.querySelectorAll('.checkout-item').forEach(itemElement => {
                const productId = itemElement.dataset.productId;
                const quantitySpan = itemElement.querySelector('.quantity');
                itemElement.querySelector('.quantity-minus').addEventListener('click', () => updateCartItemQuantity(productId, parseInt(quantitySpan.textContent) - 1));
                itemElement.querySelector('.quantity-plus').addEventListener('click', () => updateCartItemQuantity(productId, parseInt(quantitySpan.textContent) + 1));
                itemElement.querySelector('.remove-item-btn').addEventListener('click', () => updateCartItemQuantity(productId, 0));
            });
        };
        const generateOrderText = () => {
            const cart = getCart();
            let message = "Hello! I would like to place the following order:\n";
            message += "--------------------------------\n";
            let total = 0;
            cart.forEach(item => { const product = productData[item.id]; const subtotal = product.price * item.quantity; total += subtotal; message += `- ${product.name}: ${item.quantity}kg (₹${subtotal})\n`; });
            message += "--------------------------------\n";
            message += `TOTAL BILL: ₹${total}\n`;
            return message;
        };
        document.getElementById('send-whatsapp-btn').addEventListener('click', () => { const phoneNumber = '918898573121'; const message = encodeURIComponent(generateOrderText()); window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank'); });
        document.getElementById('send-email-btn').addEventListener('click', () => { const email = 'methiandmore@gmail.com'; const subject = encodeURIComponent('New Order from Website'); const body = encodeURIComponent(generateOrderText()); window.location.href = `mailto:${email}?subject=${subject}&body=${body}`; });
        renderCartItems();
    }

    // --- Run on every page load ---
    updateCartBanner();
});
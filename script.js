document.addEventListener('DOMContentLoaded', () => {

    // --- Product Database ---
    // A central place for product names and prices.
    const productData = {
        "methiLadoo": { name: "Methi Ladoo", price: 800 },
        "paushtikLadoo": { name: "Paushtik Ladoo", price: 900 },
        "dryFruitLadoo": { name: "Dry Fruit Ladoo", price: 1000 }
    };

    // --- Core UI Functions ---
    // This part handles the mobile navigation menu (hamburger icon).
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('active')) {
                mobileNavToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });

    // This part handles the 3D flip animation for the cards.
    document.querySelectorAll('.flashcard').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;
            card.classList.toggle('flipped');
        });
    });

    // --- Toast Notification Function ---
    // This shows the little "Item added to cart!" message.
    let toastTimeout;
    const showToastNotification = (message) => {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.remove('hidden');

        clearTimeout(toastTimeout);

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
        showToastNotification(`${quantity}kg of ${productData[productId].name} added to cart!`);
    };

    // This attaches the click listeners to all the +/- and "Add to Cart" buttons.
    document.querySelectorAll('[data-product-id]').forEach(productElement => {
        const productId = productElement.getAttribute('data-product-id');
        const quantitySpan = productElement.querySelector('.quantity');
        const minusBtn = productElement.querySelector('.quantity-minus');
        const plusBtn = productElement.querySelector('.quantity-plus');
        const addBtn = productElement.querySelector('.add-to-cart-btn');

        if (quantitySpan) {
            if (minusBtn) { minusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); if (q > 1) quantitySpan.textContent = q - 1; }); }
            if (plusBtn) { plusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); quantitySpan.textContent = q + 1; }); }
            if (addBtn) { addBtn.addEventListener('click', () => { const q = parseInt(quantitySpan.textContent); addToCart(productId, q); }); }
        }
    });

    // --- Page Specific Logic ---

    // This handles the smart scrolling on the Products page.
    if (document.querySelector('.product-list')) {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }
    
    // --- CHECKOUT PAGE LOGIC (REBUILT FOR FORMSUBMIT) ---
    if (document.getElementById('checkout-page')) {
        const checkoutForm = document.getElementById('checkout-form');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutSummary = document.getElementById('checkout-summary');
        const totalBillSpan = document.getElementById('total-bill-amount');
        
        const renderCartItems = () => {
            const cart = getCart();
            if (!cartItemsContainer) return;
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
                if (checkoutSummary) checkoutSummary.classList.add('hidden');
                return;
            }
            if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
            if (checkoutSummary) checkoutSummary.classList.remove('hidden');
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
            if(totalBillSpan) totalBillSpan.textContent = `₹${total}`;
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
        
        // New handler for the form submission
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (event) => {
                // Generate the order details just before submitting
                const cart = getCart();
                const totalBill = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);
                
                let orderDetailsText = "ORDER SUMMARY:\n";
                orderDetailsText += "--------------------------------\n";
                cart.forEach(item => {
                    const product = productData[item.id];
                    const subtotal = product.price * item.quantity;
                    orderDetailsText += `- ${product.name}: ${item.quantity}kg (₹${subtotal})\n`;
                });
                orderDetailsText += "--------------------------------\n";
                orderDetailsText += `TOTAL BILL: ₹${totalBill}`;

                // Create a hidden textarea to hold the order details for the email
                const hiddenOrderDetails = document.createElement('textarea');
                hiddenOrderDetails.name = "Order Details";
                hiddenOrderDetails.value = orderDetailsText;
                hiddenOrderDetails.style.display = "none";
                checkoutForm.appendChild(hiddenOrderDetails);
                
                // Clear the cart from local storage after submission
                saveCart([]);
            });
        }
        
        // Initial render on page load
        renderCartItems();
    }
    
    // --- Run on every page load ---
    updateCartBanner();
});
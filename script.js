document.addEventListener('DOMContentLoaded', () => {

    // --- 1. EmailJS Configuration ---
    // Make sure your 4 keys from the EmailJS dashboard are pasted here
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID_TO_OWNER = 'YOUR_ORDER_NOTIFICATION_TEMPLATE_ID'; 
    const EMAILJS_TEMPLATE_ID_TO_CUSTOMER = 'YOUR_CUSTOMER_RECEIPT_TEMPLATE_ID'; 
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error("EmailJS SDK not loaded.");
    }
    
    // --- 2. Product Database ---
    const productData = { "methiLadoo": { name: "Methi Ladoo", price: 800 }, "paushtikLadoo": { name: "Paushtik Ladoo", price: 900 }, "dryFruitLadoo": { name: "Dry Fruit Ladoo", price: 1000 } };

    // --- 3. Core UI Functions (Menu, Flips, Toast) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) { mobileNavToggle.addEventListener('click', () => { mobileNavToggle.classList.toggle('active'); mainNav.classList.toggle('active'); }); }
    document.querySelectorAll('.main-nav a').forEach(link => { link.addEventListener('click', () => { if (mainNav && mainNav.classList.contains('active')) { mobileNavToggle.classList.remove('active'); mainNav.classList.remove('active'); } }); });
    document.querySelectorAll('.flashcard').forEach(card => { card.addEventListener('click', (e) => { if (e.target.closest('button, a')) return; card.classList.toggle('flipped'); }); });
    let toastTimeout;
    const showToastNotification = (message) => { const toast = document.getElementById('toast-notification'); if (!toast) return; toast.textContent = message; toast.classList.remove('hidden'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { toast.classList.add('hidden'); }, 3000); };

    // --- 4. Shopping Cart Logic ---
    const getCart = () => JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const saveCart = (cart) => localStorage.setItem('shoppingCart', JSON.stringify(cart));
    const updateCartBanner = () => { const cart = getCart(); const banner = document.getElementById('floating-cart-banner'); const itemCountSpan = document.getElementById('cart-item-count'); if (!banner || !itemCountSpan) return; const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); if (totalItems > 0) { itemCountSpan.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} in cart`; banner.classList.remove('hidden'); } else { banner.classList.add('hidden'); } };
    const addToCart = (productId, quantity) => { const cart = getCart(); const existingItem = cart.find(item => item.id === productId); if (existingItem) { existingItem.quantity += quantity; } else { cart.push({ id: productId, quantity: quantity }); } saveCart(cart); updateCartBanner(); showToastNotification(`${quantity}kg of ${productData[productId].name} added to cart!`); };
    document.querySelectorAll('[data-product-id]').forEach(productElement => { const productId = productElement.getAttribute('data-product-id'); const quantitySpan = productElement.querySelector('.quantity'); const minusBtn = productElement.querySelector('.quantity-minus'); const plusBtn = productElement.querySelector('.quantity-plus'); const addBtn = productElement.querySelector('.add-to-cart-btn'); if (quantitySpan) { if (minusBtn) { minusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); if (q > 1) quantitySpan.textContent = q - 1; }); } if (plusBtn) { plusBtn.addEventListener('click', () => { let q = parseInt(quantitySpan.textContent); quantitySpan.textContent = q + 1; }); } if (addBtn) { addBtn.addEventListener('click', () => { const q = parseInt(quantitySpan.textContent); addToCart(productId, q); }); } } });

    // --- 5. Page Specific Logic ---
    if (document.querySelector('.product-list')) { const hash = window.location.hash; if (hash) { const targetElement = document.querySelector(hash); if (targetElement) { setTimeout(() => { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); } } }
    
    // --- 6. CHECKOUT PAGE LOGIC (with MERGED actions) ---
    if (document.getElementById('checkout-page')) {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutSummary = document.getElementById('checkout-summary');
        const totalBillSpan = document.getElementById('total-bill-amount');
        const orderSuccessMessage = document.getElementById('order-success-message');
        
        const renderCartItems = () => { const cart = getCart(); if (!cartItemsContainer) return; cartItemsContainer.innerHTML = ''; if (cart.length === 0) { if (emptyCartMessage) emptyCartMessage.classList.remove('hidden'); if (checkoutSummary) checkoutSummary.classList.add('hidden'); return; } if (emptyCartMessage) emptyCartMessage.classList.add('hidden'); if (checkoutSummary) checkoutSummary.classList.remove('hidden'); cart.forEach(item => { const product = productData[item.id]; const itemElement = document.createElement('div'); itemElement.className = 'checkout-item'; itemElement.setAttribute('data-product-id', item.id); itemElement.innerHTML = `<div class="item-info"><h4>${product.name}</h4><p>₹${product.price}/kg</p></div><div class="item-controls"><div class="quantity-control"><button class="quantity-minus">-</button><span class="quantity">${item.quantity}</span><button class="quantity-plus">+</button></div><button class="remove-item-btn">Remove</button></div>`; cartItemsContainer.appendChild(itemElement); }); updateTotalBill(); attachCheckoutEventListeners(); };
        const updateTotalBill = () => { const cart = getCart(); const total = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0); if(totalBillSpan) totalBillSpan.textContent = `₹${total}`; };
        const updateCartItemQuantity = (productId, newQuantity) => { let cart = getCart(); if (newQuantity <= 0) { cart = cart.filter(item => item.id !== productId); } else { const item = cart.find(item => item.id === productId); if (item) item.quantity = newQuantity; } saveCart(cart); renderCartItems(); };
        const attachCheckoutEventListeners = () => { document.querySelectorAll('.checkout-item').forEach(itemElement => { const productId = itemElement.dataset.productId; const quantitySpan = itemElement.querySelector('.quantity'); itemElement.querySelector('.quantity-minus').addEventListener('click', () => updateCartItemQuantity(productId, parseInt(quantitySpan.textContent) - 1)); itemElement.querySelector('.quantity-plus').addEventListener('click', () => updateCartItemQuantity(productId, parseInt(quantitySpan.textContent) + 1)); itemElement.querySelector('.remove-item-btn').addEventListener('click', () => updateCartItemQuantity(productId, 0)); }); };

        const generateOrderText = () => {
            const cart = getCart();
            let message = "Hello! I would like to place the following order:\n\n";
            let total = 0;
            cart.forEach(item => {
                const product = productData[item.id];
                const subtotal = product.price * item.quantity;
                total += subtotal;
                message += `- ${product.name}: ${item.quantity}kg (₹${subtotal})\n`;
            });
            message += "--------------------------------\n";
            message += `TOTAL BILL: ₹${total}`;
            return message;
        };

        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                const customerNameInput = document.getElementById('customer-name');
                const customerEmailInput = document.getElementById('customer-email');
                if (!customerNameInput || !customerEmailInput) return;
                const customerName = customerNameInput.value.trim();
                const customerEmail = customerEmailInput.value.trim();
                if (!customerName || !customerEmail) { alert('Please fill in your name and email address to receive a receipt.'); return; }
                if (typeof emailjs === 'undefined') { alert('Could not connect to the mail service. Please try again later.'); return; }

                // --- MERGED LOGIC STARTS HERE ---
                
                const orderDetailsText = generateOrderText();
                const totalBill = getCart().reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);
                const templateParams = { customer_name: customerName, customer_email: customerEmail, order_details: orderDetailsText, total_bill: totalBill };

                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Processing...';

                // Action 1: Open WhatsApp Link
                const phoneNumber = '918898573121';
                const whatsappMessage = encodeURIComponent(orderDetailsText);
                window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
                
                // Action 2: Send Emails via EmailJS
                Promise.all([
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_TO_OWNER, templateParams),
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_TO_CUSTOMER, templateParams)
                ]).then(
                    (responses) => {
                        console.log('Emails sent successfully!', responses);
                        saveCart([]);
                        updateCartBanner();
                        if (cartItemsContainer) cartItemsContainer.classList.add('hidden');
                        if (checkoutSummary) checkoutSummary.classList.add('hidden');
                        if (orderSuccessMessage) orderSuccessMessage.classList.remove('hidden');
                    },
                    (error) => {
                        console.log('Email sending FAILED...', error);
                        // Even if emails fail, we don't want to stop the user. 
                        // The WhatsApp message is the primary action.
                        // We can just log the error and maybe inform the user.
                        alert('Your order was sent via WhatsApp, but there was an issue sending the email receipt.');
                        // We still want to show the success message because the main action (WhatsApp) was initiated.
                        if (cartItemsContainer) cartItemsContainer.classList.add('hidden');
                        if (checkoutSummary) checkoutSummary.classList.add('hidden');
                        if (orderSuccessMessage) {
                            orderSuccessMessage.querySelector('p').textContent = "Your order has been sent via WhatsApp! (There was an error sending the email receipt.)";
                            orderSuccessMessage.classList.remove('hidden');
                        }
                    }
                );
            });
        }
        
        renderCartItems();
    }
    
    // --- 7. Run on every page load ---
    updateCartBanner();
});
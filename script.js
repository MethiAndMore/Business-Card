document.addEventListener('DOMContentLoaded', () => {

    // --- EmailJS Configuration ---
    // PASTE YOUR 4 KEYS FROM THE EMAILJS DASHBOARD HERE
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID_TO_OWNER = 'YOUR_ORDER_NOTIFICATION_TEMPLATE_ID';
    const EMAILJS_TEMPLATE_ID_TO_CUSTOMER = 'YOUR_CUSTOMER_RECEIPT_TEMPLATE_ID';
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    
    // Initialize EmailJS
    (function(){
        emailjs.init(EMAILJS_PUBLIC_KEY);
     })();

    // ... (All other code from the previous script remains the same) ...

    // --- CHECKOUT PAGE LOGIC (MODIFIED) ---
    if (document.getElementById('checkout-page')) {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutSummary = document.getElementById('checkout-summary');
        const totalBillSpan = document.getElementById('total-bill-amount');
        const orderSuccessMessage = document.getElementById('order-success-message');
        
        // ... (renderCartItems, updateTotalBill, updateCartItemQuantity functions are the same)
        const renderCartItems = () => { /* ... same code as before ... */ };
        const updateTotalBill = () => { /* ... same code as before ... */ };
        const updateCartItemQuantity = (productId, newQuantity) => { /* ... same code as before ... */ };
        const attachCheckoutEventListeners = () => { /* ... same code as before ... */ };
        // ---

        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                const customerNameInput = document.getElementById('customer-name');
                const customerEmailInput = document.getElementById('customer-email');
                const customerName = customerNameInput.value.trim();
                const customerEmail = customerEmailInput.value.trim();

                // Simple validation
                if (!customerName || !customerEmail) {
                    alert('Please fill in your name and email address.');
                    return;
                }

                // Prepare order details for email templates
                const cart = getCart();
                const orderDetailsText = cart.map(item => {
                    const product = productData[item.id];
                    const subtotal = product.price * item.quantity;
                    return `- ${product.name}: ${item.quantity}kg (₹${subtotal})`;
                }).join('\n');
                
                const totalBill = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);

                const templateParams = {
                    customer_name: customerName,
                    customer_email: customerEmail,
                    order_details: orderDetailsText,
                    total_bill: totalBill
                };

                // Disable button to prevent multiple clicks
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Sending...';

                // Send the two emails via EmailJS
                Promise.all([
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_TO_OWNER, templateParams),
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_TO_CUSTOMER, templateParams)
                ]).then(
                    (responses) => {
                        console.log('SUCCESS!', responses);
                        // Clear the cart
                        saveCart([]);
                        updateCartBanner();
                        
                        // Show success message
                        cartItemsContainer.classList.add('hidden');
                        checkoutSummary.classList.add('hidden');
                        orderSuccessMessage.classList.remove('hidden');
                    },
                    (error) => {
                        console.log('FAILED...', error);
                        alert('Oops! Something went wrong. Please try again.');
                        placeOrderBtn.disabled = false;
                        placeOrderBtn.textContent = 'Place Final Order';
                    }
                );
            });
        }
        
        // Initial render on page load
        renderCartItems();
    }
    
    // --- Run on every page load ---
    updateCartBanner();
});
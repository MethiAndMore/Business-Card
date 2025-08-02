document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // --- Close mobile nav when a link is clicked ---
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mobileNavToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });

    // --- Flashcard Interaction Logic ---
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        const cardInner = card.querySelector('.card-inner');

        // Flip card on main card click
        card.addEventListener('click', (e) => {
            // Prevent flipping if a button was clicked
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            card.classList.toggle('flipped');
        });

        // --- Quantity Controls ---
        const minusBtn = card.querySelector('.quantity-minus');
        const plusBtn = card.querySelector('.quantity-plus');
        const quantitySpan = card.querySelector('.quantity');

        if (minusBtn && plusBtn && quantitySpan) {
            minusBtn.addEventListener('click', () => {
                let currentQuantity = parseInt(quantitySpan.textContent);
                if (currentQuantity > 1) {
                    quantitySpan.textContent = currentQuantity - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let currentQuantity = parseInt(quantitySpan.textContent);
                quantitySpan.textContent = currentQuantity + 1;
            });
        }

        // --- WhatsApp Order Button ---
        const orderButton = card.querySelector('.whatsapp-order-button');
        if (orderButton) {
            orderButton.addEventListener('click', () => {
                const productName = card.getAttribute('data-product-name');
                const quantity = quantitySpan.textContent;
                const phoneNumber = '918898573121'; // Your WhatsApp number with country code, no + or spaces

                // Create the pre-filled message
                const message = encodeURIComponent(`Hello! I would like to order ${quantity}kg of ${productName}.`);

                // Create the WhatsApp link
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

                // Open WhatsApp
                window.open(whatsappURL, '_blank');
            });
        }
    });
});
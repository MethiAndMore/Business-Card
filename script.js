// ========== CART MANAGEMENT ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const PRODUCTS = {
    methiLadoo: {
        name: 'Methi Ladoo',
        price: 800,
        description: 'Traditional fenugreek ladoo made with pure ghee'
    },
    paushtikLadoo: {
        name: 'Paushtik Ladoo',
        price: 800,
        description: 'Energy-packed nutritious ladoo'
    },
    dryFruitLadoo: {
        name: 'Dry Fruit Ladoo',
        price: 800,
        description: 'Rich blend of premium dry fruits'
    }
};

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeQuantityControls();
    initializeAddToCart();
    initializeMobileNav();
    updateCartDisplay();
    
    // Checkout page specific
    if (document.getElementById('checkout-page')) {
        initializeCheckout();
    }
});

// ========== QUANTITY CONTROLS ==========
function initializeQuantityControls() {
    document.querySelectorAll('.quantity-minus').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const quantitySpan = this.nextElementSibling;
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantitySpan.textContent = quantity - 1;
            }
        });
    });

    document.querySelectorAll('.quantity-plus').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const quantitySpan = this.previousElementSibling;
            let quantity = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = quantity + 1;
        });
    });
}

// ========

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
// ========== ADD TO CART ==========
function initializeAddToCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.flashcard') || this.closest('.product-item');
            const productId = card.dataset.productId;
            const quantitySpan = card.querySelector('.quantity');
            const quantity = parseInt(quantitySpan.textContent) || 1;
            
            addToCart(productId, quantity);
            
            // Reset quantity to 1
            if (quantitySpan) {
                quantitySpan.textContent = '1';
            }
        });
    });
}

function addToCart(productId, quantity) {
    const product = PRODUCTS[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    showToast(`Added ${quantity} ${product.name} to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    
    if (document.getElementById('checkout-page')) {
        renderCheckoutPage();
    }
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        saveCart();
        updateCartDisplay();
        
        if (document.getElementById('checkout-page')) {
            renderCheckoutPage();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    const cartBanner = document.getElementById('floating-cart-banner');
    const cartCount = document.getElementById('cart-item-count');
    
    if (!cartBanner || !cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartBanner.classList.remove('hidden');
        cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`;
    } else {
        cartBanner.classList.add('hidden');
    }
}

// ========== TOAST NOTIFICATION ==========
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========== MOBILE NAVIGATION ==========
function initializeMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('.main-nav');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

// ========== CHECKOUT PAGE ==========
function initializeCheckout() {
    renderCheckoutPage();
    
    // Premium toggle
    const premiumToggle = document.getElementById('premium-toggle');
    const giftMessageWrapper = document.getElementById('gift-message-wrapper');
    
    if (premiumToggle && giftMessageWrapper) {
        premiumToggle.addEventListener('change', function() {
            if (this.checked) {
                giftMessageWrapper.classList.remove('hidden');
            } else {
                giftMessageWrapper.classList.add('hidden');
            }
            calculateTotal();
        });
    }
    
    // WhatsApp button
    const whatsappBtn = document.getElementById('send-whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', sendWhatsAppOrder);
    }
}

function renderCheckoutPage() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutSummary = document.getElementById('checkout-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        if (checkoutSummary) checkoutSummary.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
    if (checkoutSummary) checkoutSummary.classList.remove('hidden');
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Price: ₹${item.price} per pack</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-minus" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-plus" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <p class="item-subtotal">Subtotal: ₹${item.price * item.quantity}</p>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');
    
    calculateTotal();
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const premiumToggle = document.getElementById('premium-toggle');
    const premiumCost = (premiumToggle && premiumToggle.checked) ? 300 : 0;
    const total = subtotal + premiumCost;
    
    const totalBillAmount = document.getElementById('total-bill-amount');
    if (totalBillAmount) {
        totalBillAmount.textContent = `₹${total}`;
    }
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const premiumToggle = document.getElementById('premium-toggle');
    const giftMessage = document.getElementById('gift-message-text');
    const feedback = document.getElementById('feedback-text');
    
    let message = '🛒 *New Order from Methi & More*\n\n';
    message += '*Products:*\n';
    
    cart.forEach(item => {
        message += `• ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Subtotal:* ₹${subtotal}\n`;
    
    if (premiumToggle && premiumToggle.checked) {
        message += `*Premium Gift Wrapping:* ₹300\n`;
        
        if (giftMessage && giftMessage.value.trim()) {
            message += `\n*Gift Message:*\n${giftMessage.value.trim()}\n`;
        }
    }
    
    const total = subtotal + (premiumToggle && premiumToggle.checked ? 300 : 0);
    message += `\n*Total:* ₹${total}\n`;
    
    if (feedback && feedback.value.trim()) {
        message += `\n*Additional Notes:*\n${feedback.value.trim()}\n`;
    }
    
    const phoneNumber = '918898573121';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
    
    // Clear cart after order
    setTimeout(() => {
        cart = [];
        saveCart();
        window.location.href = 'thanks.html';
    }, 1000);
}

// ========== SMOOTH SCROLLING ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});== CART MANAGEMENT ==========
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

// =======

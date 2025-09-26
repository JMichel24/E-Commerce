// Datos de productos
const products = [
    {
        id: 1,
        title: "Zapatillas Deportivas Ultra",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 2,
        title: "Camiseta Premium Algodón",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 3,
        title: "Reloj Inteligente Pro",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 4,
        title: "Audífonos Inalámbricos",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 5,
        title: "Mochila Urbana Resistente",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1553062407-98f28e265e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 6,
        title: "Lentes de Sol Polarizados",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
];

// Productos en oferta (con descuento)
const offers = [
    {
        id: 7,
        title: "Smartwatch Galaxy Fit",
        originalPrice: 129.99,
        price: 89.99, // 30% off
        image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 8,
        title: "Set de Maquillaje Profesional",
        originalPrice: 79.99,
        price: 49.99, // 37% off
        image: "https://images.unsplash.com/photo-1522332256725-8e9b7a2c7a59?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 9,
        title: "Cámara Instantánea Mini",
        originalPrice: 99.99,
        price: 69.99, // 30% off
        image: "https://images.unsplash.com/photo-1519192275486-9e012b18a73b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
];

// Carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render Products
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" 
                 alt="${product.title}" 
                 class="product-img"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible';">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
            </div>
        </div>
    `).join('');
}

// Render Offers
function renderOffers() {
    const container = document.getElementById('offers-container');
    container.innerHTML = offers.map(offer => `
        <div class="product-card">
            <span class="badge offer-badge">-${Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)}%</span>
            <img src="${offer.image}" 
                 alt="${offer.title}" 
                 class="product-img"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Oferta';">
            <div class="product-info">
                <h3 class="product-title">${offer.title}</h3>
                <div>
                    <span class="original-price">$${offer.originalPrice.toFixed(2)}</span>
                    <span class="product-price">$${offer.price.toFixed(2)}</span>
                </div>
                <button class="add-to-cart" data-id="${offer.id}" data-is-offer="true">Agregar al Carrito</button>
            </div>
        </div>
    `).join('');
}

// Render Cart
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart');
    const totalPriceElement = document.getElementById('total-price');
    const cartCountElement = document.getElementById('cart-count');

    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        totalPriceElement.textContent = '0.00';
        cartCountElement.textContent = '0';
        document.getElementById('checkout-btn').disabled = true;
        return;
    }

    emptyCartMsg.style.display = 'none';
    cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartItemsContainer.innerHTML = cart.map(item => {
        let product = products.find(p => p.id === item.id);
        if (!product) {
            product = offers.find(o => o.id === item.id);
        }
        if (!product) return '';

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <p class="cart-item-title">${product.title}</p>
                    <p class="cart-item-price">$${product.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}">Eliminar</button>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, item) => {
        let product = products.find(p => p.id === item.id);
        if (!product) {
            product = offers.find(o => o.id === item.id);
        }
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    totalPriceElement.textContent = total.toFixed(2);
    document.getElementById('checkout-btn').disabled = false;
}

// Save Cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Add to Cart
function addToCart(productId, isOffer = false) {
    let product;
    if (isOffer) {
        product = offers.find(o => o.id === productId);
    } else {
        product = products.find(p => p.id === productId);
    }

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
    showNotification("✅ Producto agregado al carrito");
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderOffers();
    renderCart();

    // Event Listeners

    // Products Container
    document.getElementById('products-container').addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId, false);
        }
    });

    // Offers Container
    document.getElementById('offers-container').addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId, true);
        }
    });

    // Cart Modal
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCart(); // Refresh cart when opened
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Cart Items Events
    document.getElementById('cart-items').addEventListener('click', e => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('increase')) {
            updateQuantity(id, 1);
        } else if (e.target.classList.contains('decrease')) {
            updateQuantity(id, -1);
        } else if (e.target.classList.contains('remove-btn')) {
            removeFromCart(id);
        }
    });

    // Payment Methods Selection
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            radio.parentElement.classList.add('active');
        });
    });

    // Checkout Button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        // Validate form
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const payment = document.querySelector('input[name="payment"]:checked');

        if (!name || !email || !address || !phone || !payment) {
            alert('❌ Por favor completa todos los campos y selecciona un método de pago.');
            return;
        }

        // Simulate purchase
        alert(`🎉 ¡Compra exitosa!\n\nCliente: ${name}\nEmail: ${email}\nTotal: $${document.getElementById('total-price').textContent}\nMétodo: ${payment.value}`);
        
        // Clear cart
        cart = [];
        saveCart();
        cartModal.style.display = 'none';

        // Reset form
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('address').value = '';
        document.getElementById('phone').value = '';
        document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = false);
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
    });

    // Mobile Menu
    document.getElementById('mobile-menu').addEventListener('click', () => {
        document.querySelector('.nav-list').classList.toggle('active');
    });
});
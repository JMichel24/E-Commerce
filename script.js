// ==================================================
// TIENDAMODERNA PRO - SCRIPT.JS COMPLETO (PASO 1 + 2 + 3)
// ==================================================

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

// ==================================================
// FIREBASE AUTH + FIRESTORE + STRIPE — PASO 1, 2 Y 3
// ==================================================

const firebaseConfig = {
    apiKey: "AIzaSyDXgBKiABWvjnQMQa-YfEgdpz37YkYrt0Q",
    authDomain: "tiendamoderna-pro.firebaseapp.com",
    projectId: "tiendamoderna-pro",
    storageBucket: "tiendamoderna-pro.firebasestorage.app",
    messagingSenderId: "1025431129665",
    appId: "1:1025431129665:web:940b62e315fbd52c6b00c0",
    measurementId: "G-NXVH2ZT00L"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Stripe
const stripe = Stripe("pk_test_TU_PUBLIC_KEY_AQUI"); // ⚠️ REEMPLAZA ESTO

function updateAuthUI(user) {
    const userProfile = document.getElementById('user-profile');
    const authForms = document.getElementById('auth-forms');

    if (user) {
        document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
        authForms.style.display = 'none';
        userProfile.style.display = 'block';
    } else {
        authForms.style.display = 'block';
        userProfile.style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    }
}

auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toggle-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });

    document.getElementById('toggle-login').addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
});

document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;

    if (!email || !password || !name) {
        alert("❌ Por favor completa todos los campos.");
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: name
        });
        showNotification("✅ ¡Cuenta creada exitosamente!");
        document.getElementById('user-modal').style.display = 'none';
    } catch (error) {
        let msg = "Error al crear cuenta.";
        if (error.code === "auth/email-already-in-use") {
            msg = "Este correo ya está registrado.";
        } else if (error.code === "auth/weak-password") {
            msg = "La contraseña debe tener al menos 6 caracteres.";
        }
        alert("❌ " + msg);
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert("❌ Por favor completa todos los campos.");
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification("✅ ¡Bienvenido de nuevo!");
        document.getElementById('user-modal').style.display = 'none';
    } catch (error) {
        let msg = "Error al iniciar sesión.";
        if (error.code === "auth/wrong-password") {
            msg = "Contraseña incorrecta.";
        } else if (error.code === "auth/user-not-found") {
            msg = "Usuario no encontrado.";
        }
        alert("❌ " + msg);
    }
});

document.getElementById('google-login').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        showNotification("✅ ¡Iniciaste sesión con Google!");
        document.getElementById('user-modal').style.display = 'none';
    } catch (error) {
        alert("❌ Error al iniciar sesión con Google: " + error.message);
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        showNotification("👋 Sesión cerrada correctamente");
    } catch (error) {
        alert("❌ Error al cerrar sesión: " + error.message);
    }
});

// ==================================================
// FUNCIONALIDADES DE LA TIENDA
// ==================================================

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

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

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

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderOffers();
    renderCart();

    document.getElementById('products-container').addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            const isOffer = e.target.dataset.isOffer === "true";
            addToCart(productId, isOffer);
        }
    });

    document.getElementById('offers-container').addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            const isOffer = e.target.dataset.isOffer === "true";
            addToCart(productId, isOffer);
        }
    });

    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCart();
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

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

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            radio.parentElement.classList.add('active');
        });
    });

    // ✅ CHECKOUT CON STRIPE
    document.getElementById('checkout-btn').addEventListener('click', async () => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const payment = document.querySelector('input[name="payment"]:checked');

        if (!name || !email || !address || !phone || !payment) {
            alert('❌ Por favor completa todos los campos y selecciona un método de pago.');
            return;
        }

        if (payment.value !== 'stripe') {
            alert('Por ahora solo aceptamos pagos con Stripe.');
            return;
        }

        const user = auth.currentUser;

        const orderData = {
            userId: user ? user.uid : 'guest',
            userName: name,
            userEmail: email,
            userAddress: address,
            userPhone: phone,
            paymentMethod: payment.value,
            total: parseFloat(document.getElementById('total-price').textContent),
            items: cart.map(item => {
                let product = products.find(p => p.id === item.id) || offers.find(o => o.id === item.id);
                return {
                    productId: item.id,
                    title: product.title,
                    price: product.price,
                    quantity: item.quantity
                };
            }),
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // Guardar orden en Firestore primero
            const docRef = await db.collection('orders').add(orderData);
            console.log("Orden guardada con ID: ", docRef.id);

            // Crear sesión de checkout en Stripe
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderData.items,
                    customerName: name,
                    customerEmail: email,
                    customerAddress: address,
                    customerPhone: phone
                })
            });

            const session = await response.json();

            if (response.ok) {
                // Redirigir a Stripe Checkout
                const result = await stripe.redirectToCheckout({
                    sessionId: session.sessionId
                });

                if (result.error) {
                    alert(result.error.message);
                }
            } else {
                alert(session.error || 'Error al crear sesión de pago.');
            }

        } catch (error) {
            console.error("Error en checkout: ", error);
            alert("❌ Hubo un error al procesar tu pago. Inténtalo de nuevo.");
        }
    });

    document.getElementById('mobile-menu').addEventListener('click', () => {
        document.querySelector('.nav-list').classList.toggle('active');
    });

    document.getElementById('user-btn').addEventListener('click', () => {
        document.getElementById('user-modal').style.display = 'block';
    });

    document.getElementById('close-user').addEventListener('click', () => {
        document.getElementById('user-modal').style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === document.getElementById('user-modal')) {
            document.getElementById('user-modal').style.display = 'none';
        }
    });

    // Manejar redirección después de pago
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
        showNotification("🎉 ¡Pago completado! Gracias por tu compra.");
        // Limpiar carrito y resetear UI
        cart = [];
        saveCart();
        // Podrías redirigir a una página de éxito
    } else if (paymentStatus === 'cancelled') {
        showNotification("⚠️ Pago cancelado. Puedes intentarlo de nuevo.");
    }
});
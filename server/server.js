require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// Inicializar Firebase Admin
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: "YOUR_CLIENT_ID", // Opcional, no necesario para Firestore
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/" + encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

const app = express();

app.use(cors({ origin: 'http://localhost:5500' })); // Cambia si usas otro puerto
app.use(bodyParser.raw({ type: 'application/json' })); // Para webhook
app.use(express.json());

// Endpoint para crear sesión de checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, customerName, customerEmail, customerAddress, customerPhone } = req.body;

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:5500/?payment=success&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5500/?payment=cancelled',
            customer_email: customerEmail,
            metadata: {
                customerName,
                customerAddress,
                customerPhone
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook para manejar eventos de Stripe
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            const ordersRef = db.collection('orders');
            const snapshot = await ordersRef.where('sessionId', '==', session.id).get();

            if (!snapshot.empty) {
                const orderDoc = snapshot.docs[0];
                await orderDoc.ref.update({
                    status: 'paid',
                    paymentIntentId: session.payment_intent,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Orden actualizada como pagada: ${orderDoc.id}`);
            } else {
                console.log(`❌ No se encontró orden con sessionId: ${session.id}`);
            }
        } catch (error) {
            console.error("Error updating order in Firestore:", error);
        }
    }

    res.json({ received: true });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Checkout endpoint: POST http://localhost:${PORT}/create-checkout-session`);
    console.log(`🔗 Webhook endpoint: POST http://localhost:${PORT}/webhook`);
});
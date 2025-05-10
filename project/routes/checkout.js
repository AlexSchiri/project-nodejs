const sequelize = require('../config/database');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Cart, Order, ProductOrder } = require('../models/associations');
const app = express();

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Per analizzare i corpi delle richieste URL-encoded
app.set('view engine', 'ejs');

app.use(session({
  secret: 'il_tuo_segreto_segreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Imposta su true se usi HTTPS
}));


app.get('/myorders', async (req,res) => {
  try {
    const userId = req.session.user.id;
    const myOrders = await Order.findAll({
      where: { userId: userId },
      include: [{ model: ProductOrder }], // Includi i dati della tabella Item
    });
    res.render('myorders', {myOrders: myOrders})
  } catch(error) {
    console.error('Errore durante il recupero dei tuoi ordini:', error);
    res.status(500).json({ error: error.message });
  }
})


app.post('/checkout', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cartItems = await Cart.findAll({ where: { userId: userId } });

    // Recupera i dettagli dei prodotti
    const lineItems = await Promise.all(cartItems.map(async (item) => {
    
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.codart,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
        },
        quantity: item.qty,
      };
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems, // Usa l'array di line_items creato
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['IT', 'US'],
      },
      success_url: `http://localhost:3000/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });
    res.redirect(session.url);
  } catch (error) {
    console.error('Errore durante la creazione della sessione di Checkout:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/complete', async (req, res) => {
  try {
    const session_id = req.query.session_id;
    // Recupera i dettagli della sessione e degli articoli
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });
    const lineItems = session.line_items.data;

        const cartItems = await Cart.findAll({
          where: {
            userId: req.session.user.id,
          },
        });

        // Crea un nuovo ordine nel database
        const order = await Order.create({
          userId: req.session.user.id,
          total: cartItems.reduce((acc, order) => acc + order.price * order.qty, 0),
          shipment: 5,
        });
        
        //inserisco gli articoli dell'ordine
        for (const item of cartItems) {
          await ProductOrder.create({
            orderId: order.id,
            codart: item.codart,
            quantity: item.qty,
            price: item.price
          });
        }

    // Esempio di visualizzazione dei dettagli dell'ordine
    let orderDetails = '<h1>Pagamento avvenuto con successo!</h1>';
    orderDetails += '<ul>';
    lineItems.forEach((item) => {
      orderDetails += `<li>${item.quantity} x ${item.description} - ${item.price.unit_amount / 100} EUR</li>`;
    });
    orderDetails += '</ul>';

    //effettua le operazioni di pulizia del carrello, e aggiornamento del database.
    await Cart.destroy({ where: { userId: req.session.user.id } });
    // Aggiorna req.session.cartTotal a 0
    req.session.cartTotal = 0;

    res.render('complete', { lineItems: lineItems });
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli della sessione:', error);
    res.status(500).send('Errore durante il recupero dei dettagli dell\'ordine.');
  }
});
  
//gestire i webhook



module.exports = app;
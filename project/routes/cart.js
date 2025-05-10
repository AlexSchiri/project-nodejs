const sequelize = require('../config/database');
const express = require('express');
const { Articolo, Cart } = require('../models/associations');
const session = require('express-session');
const flash = require('connect-flash');
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


//GET TOTAL OF CART
app.get('/api/cart/total', (req, res) => {
    const total = req.session.cartTotal || 0;
    res.json({ success: true, totale: total });
});

//DELETE CART ITEM
app.delete('/api/delete/cart/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRows = await Cart.destroy({
      where: {
        id: id,
      },
    });
    if (deletedRows === 0) {
      // Nessun articolo trovato con l'ID specificato
      return res.status(404).json({ message: 'Articolo non trovato' });
    }
    // Eliminazione riuscita
    let userCart = await getCartPerUser(req.session.user.id);
    total = 0;
    for (let i = 0; i < userCart.length; i++) {
        total += userCart[i].qty;
    }
    req.session.cartTotal = total;
    req.flash('success', 'Articolo eliminato');
    res.json({ success: true }); // Risposta JSON di successo
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'articolo:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

//CREATE/UPDATE ITEM CART
app.post('/api/cart', async (req, res) => {
    try {
        const { codart, price, userId, quantity = 1 } = req.body;
        const product = await Articolo.findByPk(codart);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Prodotto non trovato' });
        }
  
        let cartItem = await Cart.findOne({
            where: {
                codart: codart,
                userId: userId,
            },
        });
  
        if (cartItem) {
            cartItem.qty += quantity;
            await cartItem.save();
            req.flash('success', 'Quantità aggiornata nel carrello');
        } else {
            await Cart.create({
                codart: codart,
                price: price,
                userId: userId,
                qty: quantity,
            });
            req.flash('success', 'Prodotto aggiunto al carrello');
        }
  
        let total; 
        if (req.session.user && req.session.user.id) {
            // Utente loggato
            let userCart = await getCartPerUser(userId);
            total = 0; // Assegnazione, non dichiarazione
            for (let i = 0; i < userCart.length; i++) {
                total += userCart[i].qty;
            }
            console.log("Totale loggato:", total);
        } 
        req.session.cartTotal = total;
        res.json({ success: true, codart: codart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiunta al carrello' });
    }
});
  
//UPDATE CART ITEM
app.patch('/api/update/cart/:id', async (req, res) => {
try {
    const { id, qty } = req.body; //i parametri devono essere uguali alla costruzione del json!

    let cartItem = await Cart.findOne({ where: { id: id } });

    if (cartItem) {
    if (qty === 0) {
        await cartItem.destroy();
        return res.status(200).json({ success: true, message: 'Articolo rimosso dal carrello' });
    }
    
    cartItem.qty = qty;
    await cartItem.save();
    req.flash('success', 'Quantità aggiornata');
    let userCart = await getCartPerUser(req.session.user.id);
    total = 0; // Assegnazione, non dichiarazione
    for (let i = 0; i < userCart.length; i++) {
        total += userCart[i].qty;
    }
    req.session.cartTotal = total;
    res.json({ success: true }); // Risposta JSON di successo
    } 
} catch (error) {
    req.flash('error', 'Errore interno del server');
    return res.status(500).json({ success: false });
}
});

//GO TO CART PAGE
app.get('/cart', async (req, res) => {
let userId = null; // Valore predefinito: utente non loggato
if (!req.session.user || !req.session.userId) {
    res.send('au loggati');
} else {
    const userId = req.session.user.id;  
    const items = await Cart.findAll({ where: { userId: userId } });
    res.render('cart', { 
    items: items,
    userId: userId,
    messages: {
        success: req.flash('success'),
        error: req.flash('error')
    }
    });
}
});


async function getCartPerUser(id) {
    try {
        const existingItem = await Cart.findAll({ //findAll ritorna un object che va ciclato non con reduce
        where: {
            userId: id,
        },
        });
        return existingItem;
    } catch (error) {
        console.error("Errore durante la ricerca del carrello:", error);
        return null; // o gestisci l'errore in modo appropriato
    }
}

app.get('/confirm-order', async (req,res) => {
  const myOrder = await Cart.findAll({ 
    where: {
        userId: req.session.user.id,
    },
    });
    let subtotal = 0;
    myOrder.forEach(order => {
        subtotal += order.price * order.qty; // Assicurati di usare i nomi corretti delle colonne
    });

    const shippingCost = 5; // Importo fisso per la spedizione (puoi renderlo dinamico)
    const total = subtotal + shippingCost;
    res.render('confirmation', {
      myOrder: myOrder,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
  });
})



module.exports = app;
const sequelize = require('../config/database');
const express = require('express');
const { Utente, Cart } = require('../models/associations');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
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

app.get('/login', async (req, res) => {
    if (!req.session.user) {
      res.render('login');
    } else {
      res.render('index', { session: req.session } );
    }
  });
  
  
  app.get('/register', async (req, res) => {
    if (!req.session.user) {
      res.render('register', {
        messages: {
          success: req.flash('success'),
          error: req.flash('error')
        }
      });
    } else {
      res.render('index', { session: req.session });
    }
    }
  );
  
  
app.post('/auth/register', async (req, res) => {
  const { nome, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await Utente.create({ nome, email, password: hashedPassword });
    req.flash('success', 'Utente registrato con successo'); // Aggiungi il messaggio flash
    req.session.user = user; //Salvo tutto l'oggetto utente
    req.session.userId = user.id; //salvo l'id per il carrello
    res.redirect('/');
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'Email già in uso.'); 
    } else {
      req.flash('error', 'Errore durante la registrazione.');
      console.log(error);
    }
    res.redirect('/register'); // Reindirizza alla pagina di registrazione
  }
});
  
  
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Utente.findOne({ where: { email } });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user; //Salvo tutto l'oggetto utente
    req.session.userId = user.id; //salvo l'id per il carrello

    let userCart = await getCartPerUser(user.id);
    total = 0; // Assegnazione, non dichiarazione
    for (let i = 0; i < userCart.length; i++) {
        total += userCart[i].qty;
    }
    req.session.cartTotal = total;
    
    // Salva il messaggio nella sessione
    req.session.loginSuccessMessage = 'Utente loggato con successo!';
    res.redirect('/');
  } else {
    req.flash('error', 'Credenziali non valide');
    res.redirect('/login'); // Assicurati di reindirizzare alla pagina di login
  }
});

  
  app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
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

module.exports = app
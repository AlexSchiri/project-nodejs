const sequelize = require('./config/database');
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const faker = require('./seeders/seeds');
require('dotenv').config();
const cartRouter = require('./routes/cart');
const itemRouter = require('./routes/articoli');
const registrationRouter = require('./routes/registering');
const checkoutRouter = require('./routes/checkout');
const userRouter = require('./routes/user');

app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Per analizzare i corpi delle richieste URL-encoded
//app.set('views', './views'); non serve se creiamo una cartella di nome views
app.set('view engine', 'ejs');

app.use(session({
  secret: 'il_tuo_segreto_segreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Imposta su true se usi HTTPS
}));

//middleware in tutte le rotte
app.use((req, res, next) => {
  if (!req.session.cartTotal) {
    req.session.cartTotal = 0; // Valore predefinito
  } 
  res.locals.cartTotal = req.session.cartTotal;
  res.locals.user = req.session.user;
  next();
});

app.use(cartRouter);
app.use(itemRouter);
app.use(registrationRouter);
app.use(checkoutRouter);
app.use(userRouter);

async function requireLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Sincronizzazione del modello con il database
//force: true forza la creazione delle tabelle ad ogni avvio, solo per sviluppo 
sequelize.sync()
.then(() => {
    console.log('Modelli sincronizzati con il database.');
    app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
    });
})
.catch(err => {
    console.error('Errore durante la sincronizzazione dei modelli:', err);
});

// faker.createItems(80);
// faker.createUsers(10);



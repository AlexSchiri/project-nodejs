const sequelize = require('../config/database');
const express = require('express');
const { Articolo } = require('../models/associations');
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

app.get('/', async (req, res) => {
    const latestArticles = await getLatestArticles(3);
    res.render('index', { 
      session: req.session,
      latestArticles: latestArticles
     });
});

async function getLatestArticles(limit = 10) {
    try {
      const latestArticles = await Articolo.findAll({
        order: [['createdAt', 'DESC']], 
        limit: limit 
      });
      return latestArticles;
    } catch (error) {
      console.error('Errore durante il recupero degli articoli:', error);
      return null;
    }
}


app.get('/articoli/page/:page/size/:pageSize', async (req, res) => {
    const page = parseInt(req.params.page);
    const pageSize = parseInt(req.params.pageSize);
  
    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
        return res.status(400).json({ error: 'Parametri di pagina non validi' });
    }
  
    try {
        const { count, rows: articoli } = await Articolo.findAndCountAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            order: [['codart', 'ASC']],
        });
  
        const responseData = {
            totalItems: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: page,
            pageSize: pageSize,
            articoli: articoli,
            info: "Compra i nostri articoli"
        };
      
          // Richiesta HTML
          res.render('articoli', responseData);
  
      //res.render('articoli', responseData);
        
    } catch (error) {
        console.error('Errore durante la paginazione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});
  

// Rotta per visualizzare il modulo di modifica
app.get('/articolo/:codart/edit', async (req, res) => {
    try {
      const articolo = await Articolo.findByPk(req.params.codart);
      res.render('editArticolo', { articolo: articolo });
    } catch (err) {
      console.error(err);
      res.status(500).send('Errore server');
    }
  });
  
// Rotta per aggiornare l'articolo
app.post('/articolo/:codart', async (req, res) => {
  try {
    const result = await Articolo.update(req.body, {
      where: {
          codart: req.params.codart
      }
  }); 

    res.redirect('/articolo/'+req.params.codart); // Reindirizza alla pagina principale
  } catch (err) {
    console.error(err);
    res.status(500).send('Errore server');
  }
});
  
  
app.get('/articolo/:codart', async (req, res) => {
    const codart = req.params.codart;
    let userId = null; // Valore predefinito: utente non loggato
  
    if (req.session && req.session.user && req.session.user.id) {
      userId = req.session.user.id; // L'utente è loggato, imposta l'ID
    }
  
    try {
      const articolo = await Articolo.findByPk(codart);
      res.render('articolo', {
        articolo: articolo,
        userId: userId,
        messages: {
          success: req.flash('success'),
          error: req.flash('error')
        }
      });
    } catch (error) {
      console.error('Errore durante la ricerca dell\'articolo:', error);
      res.status(500).send('Errore interno del server');
    }
});
  
module.exports = app;
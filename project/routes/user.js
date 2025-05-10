const sequelize = require('../config/database');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const { Utente } = require('../models/associations');
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


app.get('/myprofile',async (req, res) => {
    res.render('profile');
});

app.post('/myprofile/edit', async (req, res) => {
  try {
    const result = await Utente.update(req.body, {
      where: {
          id: req.session.user.id
      }
  });

  // 2. Recupera l'utente aggiornato dal database
  const updatedUser = await Utente.findByPk(req.session.user.id);

  // 3. Aggiorna la sessione con i dati aggiornati (opzionale, ma consigliato)
  req.session.user = updatedUser.dataValues;
  // 4. Renderizza la pagina del profilo con i dati aggiornati
  res.render('profile', { user: updatedUser.dataValues }); // Passa i dati aggiornati al template

}
  catch(error) {
    console.log(error);
  }
});
   

module.exports = app
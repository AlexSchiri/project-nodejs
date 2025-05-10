const express = require('express');
const { Rating } = require('../models/associations');
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


app.post('/:codart/recensione', async (req, res) => {
    try {
        const { codart, text, rating } = req.body;
        const userId = req.session.userId; // Assicurati di avere l'ID dell'utente nella sessione

        if (!userId) {
            return res.status(401).send('Utente non autenticato');
        }

        await Rating.create({
            codart: codart,
            userId: userId,
            text: text,
            rating: rating
        });

        res.redirect(`/articolo/${codart}`); // Reindirizza alla pagina dell'articolo
    } catch (error) {
        console.error('Errore durante l\'inserimento della recensione:', error);
        res.status(500).send('Errore interno del server');
    }
});

module.exports = app;
// associations.js
const Utente = require('./user');
const Articolo = require('./articolo');
const Cart = require('./cart');
const Order = require('./order');
const ProductOrder = require('./itemorder');
const Rating = require('./rating');


Articolo.hasMany(Cart, { foreignKey: 'codart' });
Cart.belongsTo(Articolo, { foreignKey: 'codart' });

Utente.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(Utente, { foreignKey: 'userId' });

//relazione ordine con articoli ordine
Order.hasMany(ProductOrder, {foreignKey: 'orderId'}); //un ordine ha piu righe productorder
ProductOrder.belongsTo(Order, {foreignKey: 'orderId'}); //un productorder appartiene ad un ordine

//relazione ordine con utente
Utente.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(Utente, { foreignKey: 'userId' }); //Definisci la foreign key in questo modo.

//relazione articolo con recensione
Articolo.hasMany(Rating, { foreignKey: 'codart' });
Rating.belongsTo(Articolo, {foreignKey: 'codart'}); 


module.exports = { Utente, Articolo, Cart, Order, ProductOrder, Rating };
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


// Definizione del modello "Articolo"
const Articolo = sequelize.define('item', {
  codart: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    },
  description: {
    type: DataTypes.TEXT,
    allowNull: false   
    },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true   
    },
  image: {
    type:DataTypes.STRING,
    allownull:true
  }   
  });


module.exports = Articolo;
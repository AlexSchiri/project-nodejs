const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Cart = sequelize.define('cart', {
  id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false  
  },
  userId: {
      type: DataTypes.BIGINT,
      allowNull: false
  },
  codart: {
      type: DataTypes.STRING,
      allowNull: false
    },
  qty: {
      type:DataTypes.INTEGER,
      allowNull: false
  },
  price: {
    type:DataTypes.DECIMAL(10,2),
    allowNull: false
  }
});

module.exports = Cart;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const ProductOrder = sequelize.define('ProductOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codart: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  isReviewed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  }
});


module.exports = ProductOrder;
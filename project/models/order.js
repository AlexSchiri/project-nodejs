const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'delivered'), // Stati dell'ordine
    defaultValue: 'pending',
    allowNull: false
  },
  shipment: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  }
});

module.exports = Order;

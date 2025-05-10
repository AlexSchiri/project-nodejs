const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Rating = sequelize.define('rating', {
id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
  codart: {
    type: DataTypes.STRING,
    allowNull: false
    },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false   
    },
  text: {
    type: DataTypes.STRING,
    allowNull: false   
    },
  rating: {
    type:DataTypes.INTEGER,
    allownull:false
  }   
  });


module.exports = Rating;
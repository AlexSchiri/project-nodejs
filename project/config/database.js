const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('nodejs', 'sa', '****', {
  host: 'localhost',
  dialect: 'mssql',
  dialectModule: require('tedious'),
  dialectOptions: {
    // Opzioni per la connessione a SQL Server
    encrypt: true, // Se il tuo server SQL Server richiede la crittografia
    trustServerCertificate: true, // Se il tuo server SQL Server utilizza un certificato autofirmato
  },
});

module.exports = sequelize;

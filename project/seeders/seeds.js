const { Utente, Articolo } = require('../models/associations');
const { faker } = require('@faker-js/faker');


async function createUsers(numUsers) {
  try {
  for (let i = 0; i < numUsers; i++) {
  await Utente.create({
    nome: faker.person.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    shipment: faker.location.streetAddress() + ", " + faker.location.city() + ", " +
              faker.location.state() + ", " + faker.location.zipCode() + ", " +
              faker.location.country(),
    billing: faker.location.streetAddress() + ", " + faker.location.city() + ", " +
              faker.location.state() + ", " + faker.location.zipCode() + ", " +
              faker.location.country(),    
    city: faker.location.city(),
    country: faker.location.state(),       
    password: "aaaaa",
  });
  }
  console.log('Database popolato con dati fittizi.');
  } catch (error) {
  console.error('Errore durante il seeding del database:', error);
  }
}

async function createItems(numUsers) {
    try {
    for (let i = 0; i < numUsers; i++) {
    await Articolo.create({
      codart: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.finance.amount(1, 100, 2, '€')
    });
    }
    console.log('Database popolato con dati fittizi.');
    } catch (error) {
    console.error('Errore durante il seeding del database:', error);
    }
  }

  module.exports = {
   createItems,
   createUsers 
  }
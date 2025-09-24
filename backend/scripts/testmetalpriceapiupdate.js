require('dotenv').config();
const mongoose = require('mongoose');
const { updateMetalPricesFromAPI } = require('../routes/metals');

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    await updateMetalPricesFromAPI();
    console.log('Function executed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
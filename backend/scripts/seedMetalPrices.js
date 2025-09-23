const mongoose = require('mongoose');
const Metal = require('../models/metal');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo';

const sampleMetalData = [
  // Gold prices
  {
    metal: 'Gold',
    purity: '24k',
    pricePerGram: 7425.50,
    change: 1.2,
    absoluteChange: 89.10,
    source: 'manual'
  },
  {
    metal: 'Gold',
    purity: '22k',
    pricePerGram: 6750.85,
    change: 1.1,
    absoluteChange: 72.50,
    source: 'manual'
  },
  {
    metal: 'Gold',
    purity: '18k',
    pricePerGram: 5565.12,
    change: 0.9,
    absoluteChange: 49.80,
    source: 'manual'
  },
  {
    metal: 'Gold',
    purity: '14k',
    pricePerGram: 4365.20,
    change: 0.8,
    absoluteChange: 34.90,
    source: 'manual'
  },
  {
    metal: 'Gold',
    purity: '10k',
    pricePerGram: 3160.30,
    change: 0.7,
    absoluteChange: 22.10,
    source: 'manual'
  },
  // Silver prices
  {
    metal: 'Silver',
    purity: 'Fine',
    pricePerGram: 84.78,
    change: 0.5,
    absoluteChange: 0.42,
    source: 'manual'
  },
  {
    metal: 'Silver',
    purity: 'Sterling',
    pricePerGram: 78.42,
    change: 0.4,
    absoluteChange: 0.31,
    source: 'manual'
  },
  {
    metal: 'Silver',
    purity: 'Coin',
    pricePerGram: 76.20,
    change: 0.3,
    absoluteChange: 0.23,
    source: 'manual'
  },
  {
    metal: 'Silver',
    purity: 'Britannia',
    pricePerGram: 81.05,
    change: 0.6,
    absoluteChange: 0.48,
    source: 'manual'
  },
  // Platinum prices
  {
    metal: 'Platinum',
    purity: '950',
    pricePerGram: 3055.85,
    change: -0.2,
    absoluteChange: -6.11,
    source: 'manual'
  },
  {
    metal: 'Platinum',
    purity: '900',
    pricePerGram: 2907.30,
    change: -0.1,
    absoluteChange: -2.91,
    source: 'manual'
  },
  {
    metal: 'Platinum',
    purity: '850',
    pricePerGram: 2746.72,
    change: 0.1,
    absoluteChange: 2.75,
    source: 'manual'
  }
];

async function seedMetalPrices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing metal prices
    console.log('Clearing existing metal prices...');
    await Metal.deleteMany({});

    // Insert sample data
    console.log('Inserting sample metal prices...');
    const insertedMetals = await Metal.insertMany(sampleMetalData);
    
    console.log(`Successfully inserted ${insertedMetals.length} metal prices:`);
    insertedMetals.forEach(metal => {
      console.log(`- ${metal.metal} ${metal.purity}: ₹${metal.pricePerGram}/g (${metal.change > 0 ? '+' : ''}${metal.change}%)`);
    });

    console.log('\nSample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding metal prices:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedMetalPrices();
}

module.exports = { seedMetalPrices, sampleMetalData };
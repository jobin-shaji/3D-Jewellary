require('dotenv').config();
const mongoose = require('mongoose');
// node-fetch v3 is ESM; use dynamic import wrapper so this file works in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // call the compute endpoint (server must be running) on localhost:3000
    const body = {
      metal: 'Gold',
      purity: '24k',
      weightGrams: 10,
      makingCharge: 2000,
      taxPercent: 3
    };

    const res = await fetch('http://localhost:3000/api/metal/compute-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // Try parsing JSON, fallback to text for HTML or other responses
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }
    console.log('Compute response:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
#!/usr/bin/env node
// Backfill script: compute and save totalPrice and latestPriceUpdate for products
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const { computeProductPrice } = require('../utils/priceUtils');

async function main() {
  const rawArgs = process.argv.slice(2);
  const argMap = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const next = rawArgs[i+1] && !rawArgs[i+1].startsWith('--') ? rawArgs[i+1] : true;
      argMap[key] = next;
      if (next !== true) i++;
    }
  }
  const dryRun = !!(argMap.dryRun || argMap.dryrun || argMap.dry);
  const limit = argMap.limit ? Number(argMap.limit) : null;
  const productIds = argMap.productIds ? String(argMap.productIds).split(',').map(s => s.trim()).filter(Boolean) : null;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment. Set it in .env or the environment and retry.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const filter = { is_active: true };
  if (productIds && productIds.length) filter.id = { $in: productIds };

  const cursor = Product.find(filter).cursor();
  let count = 0;
  let updated = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    if (limit && count >= limit) break;
    count++;

    try {
      const res = await computeProductPrice(doc);
      if (res && res.success && res.data) {
        const rounded = res.data.roundedTotal || Math.round(res.data.total || 0);
        console.log(`[${count}] Product ${doc.id} -> computed ${rounded}`);
        if (!dryRun) {
          doc.totalPrice = rounded;
          doc.latestPriceUpdate = new Date();
          await doc.save();
          updated++;
        }
      } else {
        console.warn(`[${count}] Product ${doc.id} -> compute returned no data`);
      }
    } catch (err) {
      console.error(`[${count}] Error computing product ${doc.id}:`, err.message || err);
    }
  }

  console.log(`Processed ${count} products, updated ${updated} (dryRun=${!!dryRun})`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});

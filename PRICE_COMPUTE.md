PRICE Compute and Persistence

Overview

This document describes the metal price ingestion, product price compute, and snapshot persistence features implemented in the backend. It includes API descriptions, request/response examples, environment variables, usage patterns, and migration instructions.

Key concepts

- Metal prices are fetched from MetalPriceAPI (https://metalpriceapi.com) with `base=INR` and converted from troy ounce to gram (1 troy ounce = 31.1035 g). Purity adjustments are applied per-metal/purity.
- The authoritative compute logic is centralized in `backend/utils/priceUtils.js` as `computeProductPrice(product, options)`.
- Products may store a computed snapshot: `Product.totalPrice` (Number) and `Product.latestPriceUpdate` (Date).

Environment

- `metalprice_api_key2` - API key for the metal price vendor.
- `MONGODB_URI` - MongoDB connection string (used by scripts and server).
- `PRICE_REFRESH_HOURS` (optional) - hours after which background refresh will consider a product's snapshot stale.

Endpoints

1) GET /api/metal/prices
- Query: `type` (Gold|Silver|Platinum|Palladium), `purity` (e.g. 24k, 22k, 950, Sterling)
- Behavior: Ensures price cache is updated if the latest DB record is older than 4 days. Returns list or single price object.

2) GET /api/metal/types
- Returns available metal types and purities from the DB.

3) POST /api/metal/compute-price
- Body options (two modes):
  - Full product compute (preferred): `{ product: <full product object>, persist?: boolean, taxPercent?: number }`
    - If `persist: true` and `product.id` present, the endpoint will save the computed `roundedTotal` to the product document's `totalPrice` and set `latestPriceUpdate`.
    - The endpoint ensures metal prices are up-to-date (updates from vendor if latest DB price older than 4 days).
  - Backward-compatible single-metal compute: `{ metal, purity, weightGrams, makingCharge, taxPercent }`

- Example request (compute & persist):
  ```json
  POST /api/metal/compute-price
  Content-Type: application/json

  {
    "product": {
      "id": "12345",
      "metals": [{ "type": "Gold", "purity": "22k", "weight": 8 }],
      "gemstones": [{ "type": "Diamond", "carat": 0.25, "count": 1, "price": 20000 }],
      "makingPrice": 1200
    },
    "persist": true
  }
  ```

- Example response:
  ```json
  {
    "success": true,
    "data": {
      "metalCosts": 12345.67,
      "gemstoneCosts": 20000,
      "making": 1200,
      "subtotal": 33545.67,
      "tax": 1006.37,
      "total": 34552.04,
      "roundedTotal": 34552,
      "lastUpdated": "2025-09-24T10:00:00.000Z"
    }
  }
  ```

4) POST /api/products/update-prices
- Body: optional `{ productIds: string[] }` to limit scope.
- Behavior: Computes and upserts `totalPrice` and `latestPriceUpdate` for matched products.

Migration (backfill)

- A script exists at `backend/scripts/updateAllProductPrices.js` to iterate products and compute snapshots. Example runs:

  Dry run (simulates update):
  ```powershell
  node backend/scripts/updateAllProductPrices.js --dryRun
  ```

  Real run (apply updates):
  ```powershell
  node backend/scripts/updateAllProductPrices.js
  ```

Frontend integration

- The product detail `PriceSummary` component currently prefers `product.totalPrice` when present and calls `POST /api/metal/compute-price` with `{ product }` to fetch authoritative pricing.
- The `Refresh Price` button already calls compute with `persist: true` so a user refresh will update the product snapshot in the DB.
- The backend does not return the entire product after persist; it returns the compute breakdown. Frontend may request the product again or use a callback to reconcile local state.

Testing notes

- Unit/integration tests are recommended for:
  - `computeProductPrice` correctness across metal purities and gemstone normalization (per-count semantics).
  - `POST /api/metal/compute-price` persist path (ensures DB write and timestamp update).
  - `POST /api/products/update-prices` batch behavior and rate-limiting considerations for large catalogs.

Open items

- Return persisted product snapshot from compute endpoint to avoid an extra round-trip for the client.
- Add `priceSnapshot` subdocument to `Product` to store full breakdown history (audit).
- Add integration tests and document `PRICE_REFRESH_HOURS` usage and recommended values.

Contact

- For questions about rounding, tax rules, or gemstone pricing semantics, check `backend/utils/priceUtils.js`.

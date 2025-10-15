<!--
Guidance for AI coding assistants working on the 3D-Marketplace repository.
Focus: concrete, repo-specific guidance so suggestions / edits are fast and correct.
-->
# Copilot instructions for 3D-Marketplace

Short, focused guidance for AI assistants making code changes in this repository.

## Big-picture architecture
- Monorepo-like structure with two main parts:
  - `backend/` — Express + Mongoose API server. Entry: `backend/server.js`.
  - `frontend/` — Vite + React (TypeScript) UI. Entry: `frontend/src/main.tsx` and `frontend/src/App.tsx`.
- Backend exposes REST endpoints under `/api/*` (see `backend/server.js` for mounted routers). Important routes live in `backend/routes/*` (e.g. `products.js`, `auth.js`, `orders.js`).
- Data model: Mongoose models in `backend/models/*.js`. Product pricing logic is centralized in `backend/utils/priceUtils.js` and used by product routes.

## Key developer workflows (what to run)
- Start backend in dev: from `backend/` run `npm run dev` (uses `nodemon server.js`).
- Run backend tests: `npm test` in `backend/` (Jest + supertest configured).
- Start frontend in dev: from `frontend/` run `npm run dev` (Vite server).
- Build frontend: `npm run build` inside `frontend/`.

Notes: environment variables drive behaviour. Backend expects `MONGODB_URI`, `PORT`, `JWT_SECRET`, and Cloudinary keys when testing uploads. Frontend reads `dotenv` values at build/dev time.

## Project-specific conventions & patterns
- Auth: JWT tokens are returned with a rich payload (see `backend/utils/jwt.js`). Many backend routes protect admin operations by checking `req.user.role === 'admin'` after `authenticateToken` middleware.
- Product IDs: custom string `id` fields are used in models and routes (`Product.findOne({ id })`) rather than Mongo _id in many places — preserve this when searching/updating.
- Price calculation: Always use `computeProductPrice(...)` from `backend/utils/priceUtils.js` when creating/updating products or variants; routes expect `totalPrice`/`variant.totalPrice` to be set from that utility.
- File uploads: Cloudinary + multer are used (`backend/routes/products.js`) with multiple Cloudinary storages (images, certificates, models). 3D models are uploaded as `resource_type: 'raw'` and limited to ~10MB.
- Background tasks: lightweight background price refreshes are fire-and-forget in some routes (see products listing); avoid long blocking operations in request handlers.

## Code style & practices to follow
- Backend is CommonJS (`"type": "commonjs"` in backend/package.json) — use `require()` and `module.exports` for backend code.
- Frontend is ESM + TypeScript — follow existing import alias style (`@/...`) used in `frontend/src`.
- Keep API error messages and HTTP status codes consistent with existing routes (400 for validation, 401/403 for auth, 404 for not found, 500 for server errors).

## Integration points & external dependencies
- Cloudinary: credentials in env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). See `backend/utils/uploadConfig.js`.
- MongoDB: `MONGODB_URI` — backend connects on startup. Tests may assume a running test DB or mocking.
- Payments: Razorpay is used (`razorpay` dependency) — see `backend/routes/payments.js` and services.

## Examples of edits and patterns
- When adding a new admin-protected route, apply `authenticateToken` and then check `req.user.role === 'admin'` (pattern used across `routes/*`).
- When changing product price logic, update `backend/utils/priceUtils.js` and update all call sites in `routes/products.js` where `computeProductPrice(...)` is invoked.
- To add a new frontend page, add the component under `frontend/src/features/.../pages` and register the route in `frontend/src/App.tsx` within `<Routes>`.

## Quick search terms & files to review before edits
- `computeProductPrice` — pricing logic (`backend/utils/priceUtils.js`).
- `authenticateToken` — JWT middleware (`backend/utils/jwt.js`).
- `Product.findOne({ id: ` — many product handlers use this pattern (`backend/routes/products.js`).
- Frontend routing — `frontend/src/App.tsx`.

## When in doubt / missing environment details
- If an env var or external service (Cloudinary, Mongo) is required but not available for local testing, prefer adding robust fallback behavior (clear error messages, dev-only mocks) rather than making network calls.

---
If you'd like, I can commit this file and/or expand any section (examples for tests, CI, or a checklist for adding endpoints). Any missing operational details you want included (CI commands, required env vars, or preferred branch/PR rules)?

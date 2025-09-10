# Frontend Edit Guide — 3Dmini / Full (Admin & Product)

Purpose
- Single-file reference with the minimal, essential info needed to safely edit, test and save frontend changes (AdminDashboard & product flows).
- Keep this file in the frontend folder so it persists independently of chat logs.

## Project basics
- Frontend root: x:\mydesk\Projects\3Dmini\Full\frontend
- Dev: npm run dev
- Build: npm run build
- TypeScript + React (TSX) conventions used throughout.

## Important files (quick map)
- src/pages/AdminDashboard.tsx — Admin UI (inventory, stock, delete, metal prices)
- src/pages/ProductManagement.tsx — Product create/edit (forms, specifications)
- src/components/ui/* — shared UI primitives (Button, Card, Table, etc.)
- src/services/auth.ts — auth helpers (login/logout, token)
- src/hooks/use-toast.ts — toast notifications used in admin pages
- src/services/api.ts or inline fetch calls — network requests (may be inline in pages)

## API (expected) — backend endpoints Admin uses
Base URL default: http://localhost:3000
If you centralize, use VITE_API_URL and reference it in fetch calls.

Endpoints used by AdminDashboard:
- GET  /api/products/with-primary-images?limit=50
  - Response: { products: [ Product ] }
  - Product includes: id/_id, name, description, price, stock_quantity, is_active, featured, category { id/_id, name }, primaryImage { image_url, alt_text }
- DELETE /api/products/:id
  - Requires Authorization: Bearer <token>
- PUT /api/products/:id/stock
  - Body: { stock_quantity: number }
  - Requires Authorization: Bearer <token>
- GET /api/products/:id/full
  - Full product details for edit view (specifications, customizations)

If a route name differs, update the fetch URLs in AdminDashboard.tsx and ProductManagement.tsx.

## Auth & token
- JWT token stored in localStorage key: `token` (AdminDashboard reads it)
- Requests requiring auth must include header `Authorization: Bearer <token>`
- Backend uses Mongoose + JWT — ensure backend auth middleware is active for admin routes.

## Data shapes (frontend expectations)
Product (minimal fields used in AdminDashboard)
- id | _id: string
- name: string
- description: string
- price: number
- stock_quantity: number
- is_active: boolean
- featured: boolean
- category?: { id | _id: string, name: string }
- primaryImage?: { image_url: string, alt_text?: string }
- specifications?: {
    metals?: Array<{ type?: string, purity?: string, weight?: string, finish?: string }>,
    gemstones?: Array<{ type?: string, count?: number, cut?: string, color?: string, size?: string }>
  }
- customizations?: Array<any>

Example product JSON (for testing)
{
  "name": "Necklace A",
  "price": 1299.99,
  "stock_quantity": 12,
  "is_active": true,
  "featured": false,
  "category": { "name": "Necklaces" },
  "primaryImage": { "image_url": "https://...", "alt_text": "Necklace A" },
  "specifications": {
    "metals": [{ "type": "Gold", "purity": "18K", "weight": "8g", "finish": "Polished" }],
    "gemstones": [{ "type": "Diamond", "count": 1, "cut": "Round", "color": "D", "size": "2ct" }]
  }
}

## Frontend edits checklist
- When changing API paths: update every fetch() call (search workspace for the endpoint).
- When changing Product data model: update TypeScript interfaces in AdminDashboard.tsx and ProductManagement.tsx.
- When adding auth-protected actions: include token header (localStorage.getItem('token')).
- When changing the specifications format: update serialization (ProductManagement handleSubmit) and the UI that renders `specifications` for the product detail page.

## Common edit tasks & where to change
- Add stock edit UI in admin table — src/pages/AdminDashboard.tsx (product list table, stock cell)
- Add product fields to create/edit — src/pages/ProductManagement.tsx (form + handleSubmit)
- Change badges / UI tokens — src/components/ui/*
- Centralize API base URL — create src/config/api.ts with:
  export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

## Dev & debug tips
- Open browser console to inspect fetch requests and response payload shapes.
- Use Postman/curl to confirm backend endpoints before changes.
- If path-to-regexp or route errors occur, verify frontend isn't using a full URL string where route path expected (only backend concern).
- If CORS errors appear, ensure backend CORS allows frontend origin(s).

## Notes & assumptions
- Backend uses Mongoose + JWT (admin-only endpoints require valid token).
- This file is intentionally minimal — expand with team-specific conventions (envs, testing, linting) if needed.
- Save this file in the frontend folder so it remains with
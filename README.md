# LuxeMart — Full MERN E‑Commerce

Complete stack: Express + MongoDB backend and Vite + React + Redux Toolkit Query frontend.

## Prerequisites

- Node.js 18+
- MongoDB (local `mongod` or Atlas URI)
- Optional: Cloudinary account (product/avatar uploads), Stripe account (payments + webhooks), SMTP mailbox (transactional email)

## 1. Backend (`ecommerce/server`)

```bash
cd ecommerce/server
npm install
```

1. Copy `server/.env` and set:
   - `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/ecommerce`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — long random strings
   - `CLIENT_URL=http://localhost:5173`
   - Cloudinary / Stripe / SMTP keys if you use those features

2. Seed demo data (admin + user + **25** products + coupons):

```bash
npm run seed
```

Defaults after seed:

- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User123!`

3. Start API:

```bash
npm run dev
```

API listens on `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

Stripe webhooks (optional): expose `POST /api/payment/webhook` with the **raw** body (already configured in `server.js`). Use `STRIPE_WEBHOOK_SECRET` from the Stripe CLI or dashboard.

## 2. Frontend (`ecommerce/client`)

```bash
cd ecommerce/client
npm install
```

Create `client/.env` (see `client/.env` template):

- `VITE_API_URL=` — leave empty to use the Vite dev proxy (`/api` → `localhost:5000`), or set full API origin in production.
- `VITE_STRIPE_PUBLISHABLE_KEY=` — Stripe publishable key for card checkout (optional; COD still works without it).

```bash
npm run dev
```

Open `http://localhost:5173`.

## 3. Production build (client)

```bash
cd ecommerce/client
npm run build
npm run preview
```

Serve the API with `NODE_ENV=production`, secure cookies (`sameSite`/`secure` follow `server` code), and point `CLIENT_URL` to your deployed storefront origin.

## Feature map (high level)

- JWT **access + refresh** cookies, `/api/auth/refresh`, Axios 401 retry
- Catalog filters, pagination, wishlist (guest + user), cart (guest localStorage + logged-in DB merge on login)
- Checkout: shipping → Stripe card or COD → confirm; orders clear cart and email when SMTP is configured
- Admin: KPI dashboard, products CRUD with images, orders status, users role toggle, coupons

For Cloudinary-less local testing, product images from the seed use remote HTTPS URLs; creating new products through the admin UI requires valid Cloudinary env vars.

# Wende Delala

Ethiopian online classifieds marketplace for cars, property, and other goods.

## Project layout

- `Frontend/` React + Vite client
- `Backend/` Node.js + Express API

## Phase 1 setup

1. Install Node.js 20+ and MongoDB 7+.
2. Copy `Backend/.env.example` to `Backend/.env` and adjust values.
3. Install dependencies in each package with `npm install`.
4. Run the API with `npm run dev` from `Backend/`.
5. Run the client with `npm run dev` from `Frontend/`.

The API health check is available at `http://localhost:5000/api/v1/health`.

## Authentication and roles

- Buyers register and log in with full name, email, and password. Sessions use an httpOnly JWT cookie.
- Standard users can browse listings and contact sellers. Seller product submissions are prepared as private Telegram messages for Delala review.
- Only accounts with the `admin` role can access `/admin` APIs and publish, edit, delete, or change listing status.
- Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and optionally `ADMIN_NAME` in `Backend/.env`, then run `npm run seed:admin` from `Backend/` to create or refresh the administrator account.
- Admin sign-in uses the same email/password form at `/auth`; successful admin login opens `/admin`.

## Production deployment

This repository includes `render.yaml` for the API and `Frontend/vercel.json` for the Vite site and same-origin API proxy.

1. Import this GitHub repository into Vercel and set the Root Directory to `Frontend`. Use the Vite defaults: build command `npm run build` and output directory `dist`. The `/api/v1` proxy points to `https://wende-delala-api.onrender.com`.
2. Create a Render Blueprint from the repository root. Render reads `render.yaml`; the API service uses `Backend`, `npm ci`, `npm start`, and `/api/v1/health`.
3. Set the Render `MONGODB_URI` to a MongoDB Atlas connection string, `CLIENT_URL` to the Vercel production URL, and provide `ADMIN_EMAIL` plus a unique `ADMIN_PASSWORD` of at least 12 characters. Render generates `JWT_SECRET`.
4. Run `npm run seed:admin` once from the Render Shell to create the admin account. If using a custom Vercel domain later, update Render's `CLIENT_URL` to that domain.

The backend stores uploaded listing images in MongoDB GridFS, so uploads do not depend on Render's ephemeral local filesystem. Do not set `VITE_API_URL` in Vercel unless you also change the proxy setup.

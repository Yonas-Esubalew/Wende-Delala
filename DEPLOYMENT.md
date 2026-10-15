# Connect Vercel and Render

The frontend is deployed at `https://wende-delala.vercel.app` and the API is deployed at `https://wende-delala-1.onrender.com`.

## Render web service

In Render, open the backend Web Service and set **Root Directory** to `Backend`, **Build Command** to `npm ci`, and **Start Command** to `npm start`. Set the health check path to `/api/v1/health`.

Add these environment variables in Render (keep secrets in the dashboard; do not commit them):

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://wende-delala.vercel.app` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret |
| `ADMIN_EMAIL` | The admin login email you want |
| `ADMIN_PASSWORD` | A strong admin password |

`ADMIN_NAME` is optional. Do not use `npm run seed:admin` as the service's Start Command; that command exits after seeding and does not run the API. After the service is deployed, run the seed once from Render Shell in the `Backend` directory with `npm run seed:admin` (or `cd Backend && npm run seed:admin` if the shell starts at the repository root).

## Vercel frontend

The Vercel rewrite in `Frontend/vercel.json` proxies `/api/v1/*` requests to the Render API. In the Vercel project, set the environment variable `VITE_API_URL` to `/api/v1` for Production (and Preview if needed), or leave it unset; do **not** set it to the full Render URL. This keeps browser API calls same-origin, which is important for the app's cookie-based login.

After saving the Vercel environment variable, redeploy the frontend. Once both services are live, open `https://wende-delala.vercel.app/api/v1/health`; it should return the API health response. If Render reports that it cannot find `package.json`, check that Root Directory is exactly `Backend` and Start Command is exactly `npm start`.

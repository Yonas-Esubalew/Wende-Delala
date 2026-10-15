import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { listingRouter } from './routes/listingRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { mediaRouter } from './routes/mediaRoutes.js';
import path from 'node:path';

export const app = express();

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
};

const allowedOrigins = new Set([
  normalizeOrigin(env.clientUrl),
  'https://wende-delala.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req, _res, next) => {
  ['body', 'params', 'headers'].forEach((key) => {
    if (req[key]) {
      req[key] = mongoSanitize.sanitize(req[key]);
    }
  });
  if (req.query) {
    mongoSanitize.sanitize(req.query);
  }
  next();
});
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { service: 'wende-delala-api', status: 'ok', database: res.app.locals.databaseConnected ? 'mongodb' : 'development-fallback' }
  });
});

app.use('/api/v1/listings', listingRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/auth', authRouter);
app.use('/uploads', express.static(path.resolve('uploads')));

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    error: { message: env.nodeEnv === 'production' ? 'Internal server error' : error.message }
  });
});

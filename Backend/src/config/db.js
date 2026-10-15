import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  if (env.mongoUri.includes('<db_username>')) {
    const message = 'MONGODB_URI still contains <db_username>; replace it with the Atlas database username in Backend/.env';
    if (env.nodeEnv === 'production') throw new Error(message);
    console.warn(`MongoDB unavailable in development; using seed fallback. ${message}`);
    return false;
  }
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    if (env.nodeEnv === 'production') throw error;
    console.warn(`MongoDB unavailable in development; using seed fallback. ${error.message}`);
    return false;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

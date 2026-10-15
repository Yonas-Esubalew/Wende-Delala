import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
  app.locals.databaseConnected = await connectDatabase();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exit(1);
}

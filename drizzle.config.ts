import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  dialect: 'turso',
  schema: './db/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },

  migrations: {
    prefix: 'timestamp',
  },
  verbose: true,
  strict: true,
});

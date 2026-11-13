import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let dbInstance: any;
let poolInstance: any = null;

if (connectionString && (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://')) && !connectionString.includes('placeholder')) {
  // Use Neon / standard PostgreSQL pool
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');

  poolInstance = new Pool({
    connectionString,
    ssl: connectionString.includes('neon.tech') || connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  dbInstance = drizzle(poolInstance, { schema });
} else {
  // Embedded local zero-config PGlite instance for local development & testing
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');

  // Store database on disk so data persists across restarts
  const dbPath = process.env.PGLITE_DATA_DIR || path.resolve(process.cwd(), '../../.pglite_data');
  const client = new PGlite(dbPath);
  dbInstance = drizzle(client, { schema });
}

export const pool = poolInstance;
export const db = dbInstance;

export * from './schema';
export { schema };

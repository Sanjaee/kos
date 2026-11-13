import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import path from 'path';

async function migrateLocal() {
  const dbPath = process.env.PGLITE_DATA_DIR || path.resolve(__dirname, '../../../.pglite_data');
  const client = new PGlite(dbPath);
  
  const sqlFile = path.resolve(__dirname, '../drizzle/0000_lonely_sentry.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  console.log('Running migration on local postgres store...');
  // Split statements and execute
  const statements = sql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await client.exec(statement);
    } catch (e: any) {
      // Ignore if table/type already exists
      if (!e.message?.includes('already exists')) {
        console.warn('Migration note:', e.message);
      }
    }
  }

  console.log('✅ Local database tables ready.');
}

migrateLocal();


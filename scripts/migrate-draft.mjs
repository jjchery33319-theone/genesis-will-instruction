import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);

const migrations = [
  { sql: "ALTER TABLE will_instructions ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'submitted'", name: 'status' },
  { sql: "ALTER TABLE will_instructions ADD COLUMN currentStep INT NOT NULL DEFAULT 1", name: 'currentStep' },
];

for (const { sql, name } of migrations) {
  try {
    await conn.execute(sql);
    console.log(`✓ Added column: ${name}`);
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log(`⚠ Column already exists: ${name}`);
    } else {
      console.error(`✗ Failed ${name}:`, e.message);
    }
  }
}

await conn.end();
console.log('Migration complete.');

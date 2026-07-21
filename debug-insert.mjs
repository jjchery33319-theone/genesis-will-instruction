import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await createConnection(url);
try {
  const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM will_instructions');
  console.log('DB connection OK, row count:', rows[0].cnt);
} catch (err) {
  console.error('DB error:', err.message);
  console.error('code:', err.code);
  console.error('errno:', err.errno);
} finally {
  await conn.end();
}

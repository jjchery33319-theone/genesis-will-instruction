import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await createConnection(url);

// List all tables
const [tables] = await conn.query("SHOW TABLES");
console.log('All tables:', tables.map(t => Object.values(t)[0]));

// Try to add the column to whichever table exists
for (const tableName of ['will_instructions', 'willInstructions']) {
  try {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE 'manualNeedsAssessment'`);
    if (cols.length > 0) {
      console.log(`Column already exists in ${tableName}`);
    } else {
      await conn.query(`ALTER TABLE \`${tableName}\` ADD COLUMN manualNeedsAssessment TEXT`);
      console.log(`Added manualNeedsAssessment to ${tableName}`);
    }
  } catch (e) {
    if (e.code !== 'ER_NO_SUCH_TABLE') console.error(`${tableName}: ${e.message}`);
  }
}

await conn.end();
console.log('Done');

import { createConnection } from 'mysql2/promise';

const conn = await createConnection({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true }
});

// Check column types for varchar columns that might be too small
const [rows] = await conn.execute(`
  SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'genesis_wills' AND TABLE_NAME = 'will_instructions'
  AND DATA_TYPE IN ('varchar', 'char')
  ORDER BY CHARACTER_MAXIMUM_LENGTH ASC
`);
console.log('VARCHAR columns (smallest first):');
rows.forEach(r => console.log(`  ${r.COLUMN_NAME}: ${r.COLUMN_TYPE} (max ${r.CHARACTER_MAXIMUM_LENGTH})`));

// Also check text columns
const [textRows] = await conn.execute(`
  SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'genesis_wills' AND TABLE_NAME = 'will_instructions'
  AND DATA_TYPE IN ('text', 'mediumtext', 'longtext', 'tinytext')
  ORDER BY COLUMN_NAME
`);
console.log('\nTEXT columns:');
textRows.forEach(r => console.log(`  ${r.COLUMN_NAME}: ${r.COLUMN_TYPE}`));

await conn.end();

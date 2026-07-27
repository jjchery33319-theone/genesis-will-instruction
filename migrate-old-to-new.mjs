/**
 * Migration script: copy all records from old EU TiDB (genesis_wills)
 * to new US TiDB (hZxzjPBpmbS9sbPuVqZfyd), skipping any IDs that already exist.
 *
 * Tables migrated (in dependency order):
 *   1. will_instructions
 *   2. matters
 *   3. matter_clients
 *   4. matter_people_pool
 *   5. matter_executors
 *   6. matter_guardians
 *   7. matter_beneficiaries
 *   8. matter_gifts
 *   9. matter_pets
 *  10. matter_property
 *  11. matter_trust_clauses
 *  12. matter_wishes
 *  13. matter_letters_of_wishes
 *  14. matter_exclusions
 *  15. matter_business
 *  16. lpa_records
 */

import mysql from 'mysql2/promise';

const OLD_CFG = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 20000,
};

const NEW_CFG = {
  host: 'gateway03.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2s8wBBjpcEvWyzt.root',
  password: 'O11ueqzje665VyYG0Pcm',
  database: 'hZxzjPBpmbS9sbPuVqZfyd',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 20000,
};

// Columns that exist in OLD but NOT in NEW (skip them)
const SKIP_COLS_WILL = new Set(['editedWillHtml', 'optionalClauses']);
// Columns that exist in NEW but NOT in OLD (will be NULL / default)
// lifeInsurance, client2SameAddressAsClient1 — these are fine, just omit from INSERT

async function migrateTable(oldConn, newConn, tableName, idCol = 'id', skipCols = new Set()) {
  // Get columns of the NEW table
  const [newColRows] = await newConn.execute(`DESCRIBE \`${tableName}\``);
  const newCols = newColRows.map(r => r.Field);

  // Get columns of the OLD table
  const [oldColRows] = await oldConn.execute(`DESCRIBE \`${tableName}\``);
  const oldCols = new Set(oldColRows.map(r => r.Field));

  // Only insert columns that exist in BOTH tables, minus any explicitly skipped
  const insertCols = newCols.filter(c => oldCols.has(c) && !skipCols.has(c));

  // Fetch all rows from old DB
  const [oldRows] = await oldConn.execute(`SELECT * FROM \`${tableName}\``);
  if (oldRows.length === 0) {
    console.log(`  [${tableName}] No rows in old DB, skipping.`);
    return 0;
  }

  // Get existing IDs in new DB to avoid duplicates
  let existingIds = new Set();
  if (idCol) {
    const [existingRows] = await newConn.execute(`SELECT \`${idCol}\` FROM \`${tableName}\``);
    existingIds = new Set(existingRows.map(r => r[idCol]));
  }

  const toInsert = oldRows.filter(r => !existingIds.has(r[idCol]));
  if (toInsert.length === 0) {
    console.log(`  [${tableName}] All ${oldRows.length} rows already exist in new DB.`);
    return 0;
  }

  console.log(`  [${tableName}] Inserting ${toInsert.length} of ${oldRows.length} rows...`);

  let inserted = 0;
  for (const row of toInsert) {
    const values = insertCols.map(c => {
      const v = row[c];
      if (v instanceof Date) return v;
      if (v === undefined) return null;
      return v;
    });
    const placeholders = insertCols.map(() => '?').join(', ');
    const colList = insertCols.map(c => `\`${c}\``).join(', ');
    try {
      await newConn.execute(
        `INSERT INTO \`${tableName}\` (${colList}) VALUES (${placeholders})`,
        values
      );
      inserted++;
    } catch (err) {
      console.error(`  [${tableName}] Error inserting row ${row[idCol]}:`, err.message);
    }
  }

  console.log(`  [${tableName}] Done: ${inserted} inserted.`);
  return inserted;
}

async function main() {
  console.log('Connecting to both databases...');
  const oldConn = await mysql.createConnection(OLD_CFG);
  const newConn = await mysql.createConnection(NEW_CFG);
  console.log('Connected.\n');

  let total = 0;

  // 1. will_instructions (skip old-only columns)
  total += await migrateTable(oldConn, newConn, 'will_instructions', 'id', SKIP_COLS_WILL);

  // 2. matters
  total += await migrateTable(oldConn, newConn, 'matters', 'id');

  // 3. matter_clients
  total += await migrateTable(oldConn, newConn, 'matter_clients', 'id');

  // 4. matter_people_pool
  total += await migrateTable(oldConn, newConn, 'matter_people_pool', 'id');

  // 5. matter_executors
  total += await migrateTable(oldConn, newConn, 'matter_executors', 'id');

  // 6. matter_guardians
  total += await migrateTable(oldConn, newConn, 'matter_guardians', 'id');

  // 7. matter_beneficiaries
  total += await migrateTable(oldConn, newConn, 'matter_beneficiaries', 'id');

  // 8. matter_gifts
  total += await migrateTable(oldConn, newConn, 'matter_gifts', 'id');

  // 9. matter_pets
  total += await migrateTable(oldConn, newConn, 'matter_pets', 'id');

  // 10. matter_property
  total += await migrateTable(oldConn, newConn, 'matter_property', 'id');

  // 11. matter_trust_clauses
  total += await migrateTable(oldConn, newConn, 'matter_trust_clauses', 'id');

  // 12. matter_wishes
  total += await migrateTable(oldConn, newConn, 'matter_wishes', 'id');

  // 13. matter_letters_of_wishes
  total += await migrateTable(oldConn, newConn, 'matter_letters_of_wishes', 'id');

  // 14. matter_exclusions
  total += await migrateTable(oldConn, newConn, 'matter_exclusions', 'id');

  // 15. matter_business
  total += await migrateTable(oldConn, newConn, 'matter_business', 'id');

  // 16. lpa_records
  total += await migrateTable(oldConn, newConn, 'lpa_records', 'id');

  console.log(`\nMigration complete. Total rows inserted: ${total}`);

  await oldConn.end();
  await newConn.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

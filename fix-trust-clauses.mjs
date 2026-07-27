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

const oldConn = await mysql.createConnection(OLD_CFG);
const newConn = await mysql.createConnection(NEW_CFG);

// Get existing IDs in new DB
const [existingRows] = await newConn.execute('SELECT id FROM matter_trust_clauses');
const existingIds = new Set(existingRows.map(r => r.id));

// Fetch from old DB
const [oldRows] = await oldConn.execute('SELECT * FROM matter_trust_clauses');
const toInsert = oldRows.filter(r => !existingIds.has(r.id));
console.log(`matter_trust_clauses: ${toInsert.length} to insert of ${oldRows.length}`);

// Get columns
const [newColRows] = await newConn.execute('DESCRIBE matter_trust_clauses');
const [oldColRows] = await oldConn.execute('DESCRIBE matter_trust_clauses');
const oldColSet = new Set(oldColRows.map(r => r.Field));
const insertCols = newColRows.map(r => r.Field).filter(c => oldColSet.has(c));

let inserted = 0;
for (const row of toInsert) {
  const values = insertCols.map(c => {
    const v = row[c];
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v;
    // Convert any object/Buffer to string (handles JSON type 245)
    if (typeof v === 'object' && !Buffer.isBuffer(v)) return JSON.stringify(v);
    if (Buffer.isBuffer(v)) return v.toString('utf8');
    return v;
  });
  const placeholders = insertCols.map(() => '?').join(', ');
  const colList = insertCols.map(c => `\`${c}\``).join(', ');
  try {
    await newConn.execute(
      `INSERT INTO \`matter_trust_clauses\` (${colList}) VALUES (${placeholders})`,
      values
    );
    inserted++;
  } catch (err) {
    console.error(`Error inserting row ${row.id}:`, err.message);
  }
}
console.log(`Inserted ${inserted} trust clause rows.`);

// Final counts in new DB
const tables = ['will_instructions','matters','matter_clients','matter_people_pool','matter_executors','matter_guardians','matter_beneficiaries','matter_gifts','matter_pets','matter_property','matter_trust_clauses','matter_wishes','matter_letters_of_wishes','matter_exclusions','matter_business'];
console.log('\n=== FINAL COUNTS IN NEW DB ===');
for (const t of tables) {
  const [r] = await newConn.execute(`SELECT COUNT(*) as cnt FROM \`${t}\``);
  console.log(`  ${t}: ${r[0].cnt}`);
}

// List all will_instructions
const [wills] = await newConn.execute('SELECT id, client1FirstName, client1LastName, client2FirstName, client2LastName, createdAt FROM will_instructions ORDER BY createdAt DESC');
console.log('\n=== ALL WILL INSTRUCTIONS ===');
for (const r of wills) {
  console.log(`  ${r.id} | ${r.client1FirstName} ${r.client1LastName} | C2: ${r.client2FirstName||''} ${r.client2LastName||''}`);
}

await oldConn.end();
await newConn.end();

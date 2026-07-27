import mysql from 'mysql2/promise';

const OLD = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 15000
};

const conn = await mysql.createConnection(OLD);

const [rows] = await conn.execute('SELECT id, client1FirstName, client1LastName, client2FirstName, client2LastName, createdAt FROM will_instructions ORDER BY createdAt DESC');
console.log('=== OLD DB - WILL INSTRUCTIONS ===');
for (const r of rows) {
  console.log(`${r.id} | ${r.client1FirstName} ${r.client1LastName} | C2: ${r.client2FirstName||''} ${r.client2LastName||''} | ${r.createdAt}`);
}

const [matters] = await conn.execute('SELECT m.id, m.title, mc.first_name, mc.last_name FROM matters m LEFT JOIN matter_clients mc ON mc.matter_id = m.id AND mc.client_number = 1 ORDER BY m.created_at DESC');
console.log('\n=== OLD DB - MATTERS (V2) ===');
for (const r of matters) {
  console.log(`${r.id} | ${r.title} | ${r.first_name||''} ${r.last_name||''}`);
}

await conn.end();

import mysql from 'mysql2/promise';

const NEW_CFG = {
  host: 'gateway03.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2s8wBBjpcEvWyzt.root',
  password: 'O11ueqzje665VyYG0Pcm',
  database: 'hZxzjPBpmbS9sbPuVqZfyd',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 20000,
};

const newConn = await mysql.createConnection(NEW_CFG);

// Check matters columns
const [cols] = await newConn.execute('DESCRIBE matters');
console.log('Matters columns:', cols.map(c=>c.Field).join(', '));

// Count
const [cnt] = await newConn.execute('SELECT COUNT(*) as cnt FROM matters');
console.log('Total matters:', cnt[0].cnt);

// List matters with clients
const [matters] = await newConn.execute(`SELECT m.id, mc.first_name, mc.last_name FROM matters m LEFT JOIN matter_clients mc ON mc.matter_id = m.id ORDER BY m.id DESC LIMIT 50`);
console.log('\nMatters with clients:');
for (const r of matters) {
  console.log(`  ${r.id} | ${r.first_name||''} ${r.last_name||''}`);
}

await newConn.end();

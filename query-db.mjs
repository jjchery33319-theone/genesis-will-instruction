import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway03.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2s8wBBjpcEvWyzt.root',
  password: 'O11ueqzje665VyYG0Pcm',
  database: 'hZxzjPBpmbS9sbPuVqZfyd',
  ssl: { rejectUnauthorized: true }
});

const [rows] = await conn.execute('SELECT id, client1FirstName, client1LastName, client2FirstName, client2LastName, createdAt FROM will_instructions ORDER BY createdAt DESC');
console.log('=== WILL INSTRUCTIONS ===');
for (const r of rows) {
  console.log(`${r.id} | ${r.client1FirstName} ${r.client1LastName} | C2: ${r.client2FirstName||''} ${r.client2LastName||''} | ${r.createdAt}`);
}

await conn.end();

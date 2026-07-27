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

const [wills] = await newConn.execute('SELECT id, client1FirstName, client1LastName, client2FirstName, client2LastName, createdAt FROM will_instructions ORDER BY createdAt DESC');
console.log(`Total will_instructions: ${wills.length}`);
for (const r of wills) {
  const c2 = (r.client2FirstName||'') + ' ' + (r.client2LastName||'');
  console.log(`  ${r.id} | ${r.client1FirstName||'?'} ${r.client1LastName||'?'} | C2: ${c2.trim()||'-'}`);
}

const [matters] = await newConn.execute(`SELECT m.id, m.title, mc.first_name, mc.last_name FROM matters m LEFT JOIN matter_clients mc ON mc.matter_id = m.id ORDER BY m.created_at DESC`);
console.log(`\nTotal matters: ${matters.length}`);
for (const r of matters) {
  console.log(`  ${r.id} | ${r.title} | ${r.first_name||''} ${r.last_name||''}`);
}

await newConn.end();

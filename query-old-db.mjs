import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 15000
});

console.log('Connected to OLD database!');
const [tables] = await conn.execute('SHOW TABLES');
console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));

const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM will_instructions');
console.log('will_instructions count:', rows[0].cnt);

await conn.end();

import mysql from 'mysql2/promise';

const OLD_CFG = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 15000
};

const NEW_CFG = {
  host: 'gateway03.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2s8wBBjpcEvWyzt.root',
  password: 'O11ueqzje665VyYG0Pcm',
  database: 'hZxzjPBpmbS9sbPuVqZfyd',
  ssl: { rejectUnauthorized: true },
  connectTimeout: 15000
};

const oldConn = await mysql.createConnection(OLD_CFG);
const newConn = await mysql.createConnection(NEW_CFG);

// Get columns from old will_instructions
const [oldCols] = await oldConn.execute('DESCRIBE will_instructions');
const [newCols] = await newConn.execute('DESCRIBE will_instructions');

const oldColNames = new Set(oldCols.map(c => c.Field));
const newColNames = new Set(newCols.map(c => c.Field));

const onlyInOld = [...oldColNames].filter(c => !newColNames.has(c));
const onlyInNew = [...newColNames].filter(c => !oldColNames.has(c));
const inBoth = [...oldColNames].filter(c => newColNames.has(c));

console.log('Columns only in OLD:', onlyInOld.join(', ') || 'none');
console.log('Columns only in NEW:', onlyInNew.join(', ') || 'none');
console.log('Shared columns count:', inBoth.length);

// Check matters table columns
const [oldMatterCols] = await oldConn.execute('DESCRIBE matters');
const [newMatterCols] = await newConn.execute('DESCRIBE matters');
const oldMCols = new Set(oldMatterCols.map(c => c.Field));
const newMCols = new Set(newMatterCols.map(c => c.Field));
const mOnlyInOld = [...oldMCols].filter(c => !newMCols.has(c));
const mOnlyInNew = [...newMCols].filter(c => !oldMCols.has(c));
console.log('\nMatters - only in OLD:', mOnlyInOld.join(', ') || 'none');
console.log('Matters - only in NEW:', mOnlyInNew.join(', ') || 'none');

// Check matter_clients
const [oldMCCols] = await oldConn.execute('DESCRIBE matter_clients');
const [newMCCols] = await newConn.execute('DESCRIBE matter_clients');
const oldMCC = new Set(oldMCCols.map(c => c.Field));
const newMCC = new Set(newMCCols.map(c => c.Field));
console.log('\nmatter_clients - only in OLD:', [...oldMCC].filter(c => !newMCC.has(c)).join(', ') || 'none');
console.log('matter_clients - only in NEW:', [...newMCC].filter(c => !oldMCC.has(c)).join(', ') || 'none');

// Count matters in old db
const [oldMatters] = await oldConn.execute('SELECT COUNT(*) as cnt FROM matters');
console.log('\nOld DB matters count:', oldMatters[0].cnt);

await oldConn.end();
await newConn.end();

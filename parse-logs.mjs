import { execSync } from 'child_process';
const raw = execSync('manus-webdev-logs --limit 100', { cwd: '/home/ubuntu/genesis-will-instruction' }).toString();
const json = JSON.parse(raw);
for (const e of json.entries || []) {
  if (e.message && !e.message.includes('Missing session cookie')) {
    console.log(e.timestamp, e.severity, e.message.substring(0, 300));
  }
}

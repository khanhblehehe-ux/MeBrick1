#!/usr/bin/env node
// Simple load tester that simulates many clients polling /api/orders/:id
// Usage: node scripts/loadtest.js --clients 50 --interval 5000 --duration 60000 --backend http://localhost:5000 --orderId test123 --downloadMb 0

const { argv } = require('process');
const fetch = global.fetch || require('node-fetch');

function parseArgs() {
  const out = {};
  argv.slice(2).forEach((a, i, arr) => {
    if (!a.startsWith('--')) return;
    const k = a.slice(2);
    const v = arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true;
    out[k] = v;
  });
  return out;
}

const args = parseArgs();
const clients = Number(args.clients || 10);
const interval = Number(args.interval || 5000);
const duration = Number(args.duration || 60000);
const backend = args.backend || `http://localhost:5000`;
const orderId = args.orderId || 'loadtest-order';
const downloadMb = Number(args.downloadMb || 0);

console.log(`Loadtest starting: clients=${clients} interval=${interval}ms duration=${duration}ms backend=${backend} order=${orderId} downloadMb=${downloadMb}`);

let totalRequests = 0;
let totalBytes = 0;
let running = true;

async function clientLoop(id) {
  while (running) {
    try {
      // 1) Poll order
      const r = await fetch(`${backend}/api/orders/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
      const buf = await r.arrayBuffer();
      totalRequests++;
      totalBytes += buf.byteLength;

      // 2) optionally download a large file to simulate media
      if (downloadMb > 0) {
        const r2 = await fetch(`${backend}/api/media/large.bin?mb=${downloadMb}`);
        const b2 = await r2.arrayBuffer();
        totalRequests++;
        totalBytes += b2.byteLength;
      }
    } catch (e) {
      // ignore but count
    }
    await new Promise((res) => setTimeout(res, interval));
  }
}

async function main() {
  const clientsArr = Array.from({ length: clients }, (_, i) => clientLoop(i));
  setTimeout(() => { running = false; }, duration);

  // Wait until all clients stop
  await Promise.all(clientsArr.map((p) => p.catch(() => {})));
  console.log(`Done. totalRequests=${totalRequests} totalBytes=${totalBytes} bytes (${(totalBytes/1024/1024).toFixed(2)} MB)`);
}

main().catch((e) => console.error(e));

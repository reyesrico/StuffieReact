/**
 * scripts/db-cleanup.mjs
 *
 * Deletes the 5 legacy Codehooks collections that were superseded by the
 * Weeks 21-27 DB migration:
 *
 *   stuffiersstuff   → user_items          (Stage 11)
 *   loanrequests     → loan_requests       (Stage 9)
 *   purchaserequests → purchase_requests   (Stage 10)
 *   exchangerequests → exchange_requests   (Stage 8)
 *   stuff            → items               (Stage 12)
 *
 * Usage:
 *   node scripts/db-cleanup.mjs            ← dry-run (default)
 *   node scripts/db-cleanup.mjs --execute  ← actually delete
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

const BASE_URL = process.env.VITE_CODEHOOKS_SERVER_URL?.replace(/\/$/, '')
  ?? 'https://stuffie-2u0v.api.codehooks.io/dev';
const API_KEY = process.env.VITE_CODEHOOKS_API_KEY;

if (!API_KEY) {
  console.error('❌  VITE_CODEHOOKS_API_KEY not set. Run with --env-file=.env');
  process.exit(1);
}

const HEADERS = { 'x-apikey': API_KEY, 'Content-Type': 'application/json' };

const OLD_COLLECTIONS = [
  { name: 'stuffiersstuff',   supersededBy: 'user_items' },
  { name: 'loanrequests',     supersededBy: 'loan_requests' },
  { name: 'purchaserequests', supersededBy: 'purchase_requests' },
  { name: 'exchangerequests', supersededBy: 'exchange_requests' },
  { name: 'stuff',            supersededBy: 'items' },
];

const DRY_RUN = !process.argv.includes('--execute');

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchAll(collection) {
  const url = `${BASE_URL}/${collection}?q={}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${collection} failed [${res.status}]: ${text}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function deleteRecord(collection, _id) {
  const url = `${BASE_URL}/${collection}/${_id}`;
  const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${collection}/${_id} failed [${res.status}]: ${text}`);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║          Stuffie DB Legacy Collection Cleanup         ║');
console.log(`║  Mode: ${DRY_RUN ? '🔍 DRY-RUN (read-only)            ' : '🗑️  EXECUTE (permanent deletes)  '}  ║`);
console.log('╚══════════════════════════════════════════════════════╝\n');

if (DRY_RUN) {
  console.log('ℹ️  Pass --execute to actually delete records.\n');
}

let grandTotal = 0;

for (const col of OLD_COLLECTIONS) {
  process.stdout.write(`  Checking ${col.name.padEnd(20)} → supersedes ${col.supersededBy} ... `);
  
  let records;
  try {
    records = await fetchAll(col.name);
  } catch (err) {
    console.log(`⚠️  ${err.message}`);
    continue;
  }

  grandTotal += records.length;

  if (records.length === 0) {
    console.log('✅  0 records (already empty)');
    continue;
  }

  if (DRY_RUN) {
    console.log(`📋  ${records.length} record(s) would be deleted`);
    continue;
  }

  // ── execute mode ───────────────────────────────────────────────────────────
  process.stdout.write(`🗑️  deleting ${records.length} record(s) `);

  let deleted = 0;
  let failed = 0;
  for (const record of records) {
    try {
      await deleteRecord(col.name, record._id);
      deleted++;
      process.stdout.write('.');
    } catch (err) {
      failed++;
      process.stdout.write('✗');
      console.error(`\n     ↳ ${err.message}`);
    }
  }

  console.log(`\n     ✅  ${deleted} deleted${failed ? `, ⚠️  ${failed} failed` : ''}`);
}

console.log('\n────────────────────────────────────────────────────────');
if (DRY_RUN) {
  console.log(`  Total records that would be deleted: ${grandTotal}`);
  console.log('\n  To execute: node scripts/db-cleanup.mjs --execute\n');
} else {
  console.log(`  Done. Processed ${grandTotal} record(s) across ${OLD_COLLECTIONS.length} collections.\n`);
}

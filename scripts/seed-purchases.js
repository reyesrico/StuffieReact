/**
 * seed-purchases.js
 * Seeds the purchaserequests / purchase-requests collection with sample data.
 *
 * Works for both backends:
 *   - Codehooks  → collection auto-creates on first write
 *   - RestDB     → creates the collection via schema API, then seeds
 *
 * Usage:
 *   node scripts/seed-purchases.js              # uses backend from .env toggle (useCodehooks)
 *   node scripts/seed-purchases.js --codehooks  # force Codehooks
 *   node scripts/seed-purchases.js --restdb     # force RestDB
 *   node scripts/seed-purchases.js --both       # seed both backends
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) {
    console.error('❌  .env file not found. Copy .env.example to .env and fill in values.');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

const env = loadEnv();

// ─── Config ───────────────────────────────────────────────────────────────────
const CODEHOOKS_URL  = (env.VITE_CODEHOOKS_SERVER_URL  || 'https://stuffie-2u0v.api.codehooks.io/dev/').replace(/\/$/, '');
const CODEHOOKS_KEY  = env.VITE_CODEHOOKS_API_KEY  || '';
const RESTDB_URL     = (env.VITE_RESTDB_SERVER_URL || 'https://stuffie-98b2.restdb.io/rest/').replace(/\/$/, '');
const RESTDB_KEY     = env.VITE_RESTDB_API_KEY || '';

// Determine which backend(s) to seed
const args = process.argv.slice(2);
const forceCodehooks = args.includes('--codehooks');
const forceRestdb    = args.includes('--restdb');
const forceBoth      = args.includes('--both');

const seedCodehooks = forceBoth || forceCodehooks || (!forceRestdb && !forceBoth);
const seedRestdb    = forceBoth || forceRestdb;

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}\n${text}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

// ─── Codehooks helpers ────────────────────────────────────────────────────────
const chHeaders = {
  'x-apikey': CODEHOOKS_KEY,
  'Content-Type': 'application/json',
};

async function chGet(collection, query = '') {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch(`${CODEHOOKS_URL}/${collection}${qs}`, { headers: chHeaders });
}

async function chPost(collection, body) {
  return apiFetch(`${CODEHOOKS_URL}/${collection}`, {
    method: 'POST',
    headers: chHeaders,
    body: JSON.stringify(body),
  });
}

// ─── RestDB helpers ───────────────────────────────────────────────────────────
const rdHeaders = {
  'cache-control': 'no-cache',
  'x-apikey': RESTDB_KEY,
  'Content-Type': 'application/json',
};

async function rdGet(collection, query = '') {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch(`${RESTDB_URL}/${collection}${qs}`, { headers: rdHeaders });
}

async function rdPost(collection, body) {
  return apiFetch(`${RESTDB_URL}/${collection}`, {
    method: 'POST',
    headers: rdHeaders,
    body: JSON.stringify(body),
  });
}

/**
 * Create purchase-requests collection in RestDB via Schema API.
 * RestDB does NOT auto-create collections on first write.
 */
async function rdEnsureCollection() {
  const schemaUrl = RESTDB_URL.replace('/rest/', '/api/metadata');
  const body = {
    name: 'purchase-requests',
    fields: [
      { name: 'id_stuffier', type: 'int',    required: true  },
      { name: 'id_stuff',    type: 'int',    required: true  },
      { name: 'id_friend',   type: 'int',    required: true  },
      { name: 'cost',        type: 'float',  required: true  },
    ],
  };

  console.log('   Creating purchase-requests collection in RestDB...');
  try {
    const result = await apiFetch(schemaUrl, {
      method: 'POST',
      headers: rdHeaders,
      body: JSON.stringify(body),
    });
    console.log('   ✓ Collection created:', result?.name || JSON.stringify(result));
  } catch (err) {
    // 409 = already exists → fine
    if (err.message.includes('409') || err.message.toLowerCase().includes('already exists') || err.message.toLowerCase().includes('duplicate')) {
      console.log('   ✓ Collection already exists — skipping creation');
    } else {
      console.warn('   ⚠️  Could not auto-create collection via Schema API:', err.message);
      console.warn('   → Please create "purchase-requests" manually in the RestDB dashboard.');
      console.warn('     Fields: id_stuffier (int), id_stuff (int), id_friend (int), cost (float)');
      return false;
    }
  }
  return true;
}

// ─── Seed logic ───────────────────────────────────────────────────────────────

/**
 * Build purchase request records from real users + products.
 *
 * Strategy:
 *   1. Fetch all stuffiers (users)
 *   2. Fetch all stuffiers-stuff (user→product links)
 *   3. Fetch products that have a cost set
 *   4. For each product with a cost, find a different user to act as "buyer"
 *   5. Return up to MAX_RECORDS records
 */
async function buildRecords(getFn, collections) {
  const MAX_RECORDS = 5;

  const [users, links, stuff] = await Promise.all([
    getFn(collections.stuffiers),
    getFn(collections.stuffiersStuff),
    getFn(collections.stuff),
  ]);

  if (!Array.isArray(users) || users.length < 2) {
    throw new Error(`Need at least 2 users to seed purchase requests. Found: ${users?.length ?? 0}`);
  }
  if (!Array.isArray(links) || links.length === 0) {
    throw new Error('No stuffiers-stuff associations found. Add some products first.');
  }

  const stuffMap = {};
  for (const s of (Array.isArray(stuff) ? stuff : [])) {
    if (s.id != null) stuffMap[s.id] = s;
  }

  const records = [];
  for (const link of links) {
    if (records.length >= MAX_RECORDS) break;
    const { id_stuffier, id_stuff } = link;
    const product = stuffMap[id_stuff];
    if (!product) continue;
    const cost = product.cost ?? product.price ?? 10.0; // default cost for seeding

    // Pick a different user as buyer
    const buyer = users.find(u => u.id !== id_stuffier);
    if (!buyer) continue;

    records.push({
      id_stuffier: Number(id_stuffier),
      id_stuff:    Number(id_stuff),
      id_friend:   Number(buyer.id),
      cost:        Number(cost),
    });
  }

  if (records.length === 0) {
    console.warn('   ⚠️  No suitable products with cost found. Set a cost on at least one product and retry.');
  }

  return records;
}

async function seedCodehooksBackend() {
  console.log('\n🔵  Seeding Codehooks...');
  if (!CODEHOOKS_KEY) { console.error('   ❌  VITE_CODEHOOKS_API_KEY not set in .env'); return; }

  const collections = {
    stuffiers:     'stuffiers',
    stuffiersStuff:'stuffiersstuff',
    stuff:         'stuff',
    purchases:     'purchaserequests',
  };

  let records;
  try {
    records = await buildRecords(
      (col, q) => chGet(col, q),
      collections
    );
  } catch (err) {
    console.error('   ❌  Failed to fetch data:', err.message);
    return;
  }

  if (records.length === 0) return;

  console.log(`   Inserting ${records.length} purchase request(s)...`);
  for (const rec of records) {
    try {
      const created = await chPost(collections.purchases, rec);
      const id = created?._id ?? created?.id ?? '?';
      console.log(`   ✓  Created _id=${id}  stuff=${rec.id_stuff}  buyer=${rec.id_friend}  cost=${rec.cost}`);
    } catch (err) {
      console.error(`   ❌  Failed to insert:`, rec, err.message);
    }
  }
}

async function seedRestdbBackend() {
  console.log('\n🟢  Seeding RestDB...');
  if (!RESTDB_KEY) { console.error('   ❌  VITE_RESTDB_API_KEY not set in .env'); return; }

  const ok = await rdEnsureCollection();
  if (!ok) {
    console.log('   Skipping RestDB seed — collection must be created manually first.');
    return;
  }

  const collections = {
    stuffiers:     'stuffiers',
    stuffiersStuff:'stuffiers-stuff',
    stuff:         'stuff',
    purchases:     'purchase-requests',
  };

  let records;
  try {
    records = await buildRecords(
      (col, q) => rdGet(col, q),
      collections
    );
  } catch (err) {
    console.error('   ❌  Failed to fetch data:', err.message);
    return;
  }

  if (records.length === 0) return;

  console.log(`   Inserting ${records.length} purchase request(s)...`);
  for (const rec of records) {
    try {
      const created = await rdPost(collections.purchases, rec);
      const id = created?._id ?? created?.id ?? '?';
      console.log(`   ✓  Created _id=${id}  stuff=${rec.id_stuff}  buyer=${rec.id_friend}  cost=${rec.cost}`);
    } catch (err) {
      console.error(`   ❌  Failed to insert:`, rec, err.message);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('🛒  Stuffie — seed purchase requests');
console.log(`   Targeting: ${seedCodehooks && seedRestdb ? 'both' : seedCodehooks ? 'Codehooks' : 'RestDB'}`);

if (seedCodehooks) await seedCodehooksBackend();
if (seedRestdb)    await seedRestdbBackend();

console.log('\n✅  Done');

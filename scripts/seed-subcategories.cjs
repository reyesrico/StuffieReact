/**
 * seed-subcategories.js
 * One-time script to seed the full Stuffie subcategory taxonomy.
 * IDEMPOTENT: skips any subcategory whose `id` already exists in the DB.
 *
 * Usage:
 *   node scripts/seed-subcategories.js
 *
 * Requires: .env file with VITE_CODEHOOKS_API_KEY and VITE_CODEHOOKS_SERVER_URL
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require(require('path').join(__dirname, '..', 'node_modules/axios/dist/node/axios.cjs'));

const BASE_URL = process.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/';
const API_KEY = process.env.VITE_CODEHOOKS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: VITE_CODEHOOKS_API_KEY not found in .env');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-apikey': API_KEY, 'Content-Type': 'application/json' },
});

// ─── Full taxonomy ────────────────────────────────────────────────────────────
// Format: { id, name, category_id }
// ID scheme: cat_id × 100 + seq  (cat 10+ uses 1000+)
// Existing IDs (already in DB, will be skipped): 101,201,301,401-406,501

const SUBCATEGORIES = [
  // ── Cat 1: Clothing, Shoes, Jewelry & Watches ──────────────────────────────
  // 101 Jerseys — EXISTING, skip
  { id: 102, name: "Men's Clothing",       category_id: 1 },
  { id: 103, name: "Women's Clothing",     category_id: 1 },
  { id: 104, name: "Kids & Baby Clothing", category_id: 1 },
  { id: 105, name: "Shoes & Sneakers",     category_id: 1 },
  { id: 106, name: "Jewelry",              category_id: 1 },
  { id: 107, name: "Watches",              category_id: 1 },
  { id: 108, name: "Bags & Accessories",   category_id: 1 },
  { id: 109, name: "Sportswear",           category_id: 1 },
  { id: 110, name: "Sunglasses",           category_id: 1 },

  // ── Cat 2: Books & Audible ─────────────────────────────────────────────────
  // 201 Books — EXISTING, skip
  { id: 202, name: "Audiobooks",           category_id: 2 },
  { id: 203, name: "E-books & Kindle",     category_id: 2 },
  { id: 204, name: "Textbooks",            category_id: 2 },
  { id: 205, name: "Comics & Graphic Novels", category_id: 2 },
  { id: 206, name: "Magazines",            category_id: 2 },

  // ── Cat 3: Movies, Music & Games ──────────────────────────────────────────
  // 301 Movies — EXISTING, skip
  { id: 302, name: "TV Shows",             category_id: 3 },
  { id: 303, name: "Music (CDs & Vinyl)",  category_id: 3 },
  { id: 304, name: "Video Games",          category_id: 3 },
  { id: 305, name: "Board Games & Puzzles", category_id: 3 },

  // ── Cat 4: Electronics, Computers & Office ────────────────────────────────
  // 401 Consoles, 402 Games, 403 Computers, 404 Printers, 405 TVs, 406 Mobiles — EXISTING
  { id: 407, name: "Cameras & Photography", category_id: 4 },
  { id: 408, name: "Headphones & Audio",   category_id: 4 },
  { id: 409, name: "Smart Home Devices",   category_id: 4 },
  { id: 410, name: "Tablets & E-readers",  category_id: 4 },
  { id: 411, name: "Networking & Wi-Fi",   category_id: 4 },
  { id: 412, name: "Office Supplies",      category_id: 4 },

  // ── Cat 5: Home, Garden & Tools ───────────────────────────────────────────
  // 501 Home Furniture — EXISTING, skip
  { id: 502, name: "Kitchen & Dining",     category_id: 5 },
  { id: 503, name: "Bedding & Bath",       category_id: 5 },
  { id: 504, name: "Garden & Outdoor",     category_id: 5 },
  { id: 505, name: "Tools & Hardware",     category_id: 5 },
  { id: 506, name: "Storage & Organization", category_id: 5 },
  { id: 507, name: "Lighting",             category_id: 5 },
  { id: 508, name: "Home Decor",           category_id: 5 },
  { id: 509, name: "Appliances",           category_id: 5 },

  // ── Cat 6: Pet Supplies ───────────────────────────────────────────────────
  { id: 601, name: "Dog Supplies",         category_id: 6 },
  { id: 602, name: "Cat Supplies",         category_id: 6 },
  { id: 603, name: "Fish & Aquariums",     category_id: 6 },
  { id: 604, name: "Small Animals",        category_id: 6 },
  { id: 605, name: "Birds",               category_id: 6 },
  { id: 606, name: "Reptiles",             category_id: 6 },

  // ── Cat 7: Food & Grocery ─────────────────────────────────────────────────
  { id: 701, name: "Beverages",            category_id: 7 },
  { id: 702, name: "Snacks & Chips",       category_id: 7 },
  { id: 703, name: "Pantry & Cooking",     category_id: 7 },
  { id: 704, name: "Organic & Natural",    category_id: 7 },
  { id: 705, name: "International Foods",  category_id: 7 },
  { id: 706, name: "Breakfast & Cereal",   category_id: 7 },

  // ── Cat 8: Beauty & Health ────────────────────────────────────────────────
  { id: 801, name: "Skincare",             category_id: 8 },
  { id: 802, name: "Hair Care",            category_id: 8 },
  { id: 803, name: "Makeup & Cosmetics",   category_id: 8 },
  { id: 804, name: "Vitamins & Supplements", category_id: 8 },
  { id: 805, name: "Dental Care",          category_id: 8 },
  { id: 806, name: "Personal Care",        category_id: 8 },
  { id: 807, name: "Fragrances",           category_id: 8 },

  // ── Cat 9: Toys, Kids & Baby ──────────────────────────────────────────────
  { id: 901, name: "Action Figures & Toys", category_id: 9 },
  { id: 902, name: "Building Sets (LEGO etc.)", category_id: 9 },
  { id: 903, name: "Dolls & Plush",        category_id: 9 },
  { id: 904, name: "Baby Gear & Strollers", category_id: 9 },
  { id: 905, name: "Learning & Educational", category_id: 9 },
  { id: 906, name: "Outdoor Play",         category_id: 9 },

  // ── Cat 10: Handmade ──────────────────────────────────────────────────────
  { id: 1001, name: "Handmade Jewelry",    category_id: 10 },
  { id: 1002, name: "Handmade Clothing",   category_id: 10 },
  { id: 1003, name: "Handmade Toys",       category_id: 10 },
  { id: 1004, name: "Art & Prints",        category_id: 10 },
  { id: 1005, name: "Handmade Home Decor", category_id: 10 },
  { id: 1006, name: "Craft Supplies",      category_id: 10 },

  // ── Cat 11: Sports & Outdoors ─────────────────────────────────────────────
  { id: 1101, name: "Team Sports Equipment", category_id: 11 },
  { id: 1102, name: "Fitness & Gym",       category_id: 11 },
  { id: 1103, name: "Hiking & Camping",    category_id: 11 },
  { id: 1104, name: "Cycling",             category_id: 11 },
  { id: 1105, name: "Water Sports",        category_id: 11 },
  { id: 1106, name: "Golf",               category_id: 11 },
  { id: 1107, name: "Running & Athletics", category_id: 11 },
  { id: 1108, name: "Martial Arts",        category_id: 11 },

  // ── Cat 12: Automotive & Industrial ──────────────────────────────────────
  { id: 1201, name: "Car Parts & Accessories", category_id: 12 },
  { id: 1202, name: "Car Electronics",     category_id: 12 },
  { id: 1203, name: "Car Care & Cleaning", category_id: 12 },
  { id: 1204, name: "Motorcycles & ATVs",  category_id: 12 },
  { id: 1205, name: "Automotive Tools",    category_id: 12 },
  { id: 1206, name: "Industrial Equipment", category_id: 12 },

  // ── Cat 13: Pharmacy ──────────────────────────────────────────────────────
  { id: 1301, name: "OTC Medications",     category_id: 13 },
  { id: 1302, name: "First Aid",           category_id: 13 },
  { id: 1303, name: "Medical Devices",     category_id: 13 },
  { id: 1304, name: "Vitamins & Health Aids", category_id: 13 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('Fetching existing subcategories...');
  const { data: existing } = await client.get('/subcategories');
  const existingIds = new Set(existing.map(s => s.id));
  console.log(`Found ${existing.length} existing subcategories: [${[...existingIds].sort((a,b)=>a-b).join(', ')}]`);

  const toInsert = SUBCATEGORIES.filter(s => !existingIds.has(s.id));
  const skipped  = SUBCATEGORIES.filter(s =>  existingIds.has(s.id));

  console.log(`\nSkipping ${skipped.length} already-existing IDs.`);
  console.log(`Inserting ${toInsert.length} new subcategories...\n`);

  let ok = 0;
  let fail = 0;

  for (const sub of toInsert) {
    try {
      await client.post('/subcategories', sub);
      console.log(`  ✅ ${sub.id} — ${sub.name} (cat ${sub.category_id})`);
      ok++;
    } catch (e) {
      console.error(`  ❌ ${sub.id} — ${sub.name}: ${e.response?.data?.message || e.message}`);
      fail++;
    }
    // small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\nDone. Inserted: ${ok}, Failed: ${fail}, Skipped: ${skipped.length}`);
}

seed().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

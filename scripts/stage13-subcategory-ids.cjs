/**
 * Stage 13: Subcategory ID Redesign
 * ==================================
 * Problem: Subcategory IDs are legacy chaos (11000, 21000, 31000, 41000...) with
 *          no consistent pattern and cross-category data corruption in items.
 *
 * New scheme: cat_id * 100 + sequential_within_category
 *   Category 1 → 101, 102, 103 ...
 *   Category 2 → 201, 202, 203 ...
 *   Category 4 → 401, 402, 403, 404, 405, 406 ...
 *
 * OLD → NEW mapping:
 *   11000 (Jerseys, cat 1)         → 101
 *   21000 (Books,   cat 2)         → 201
 *   41000 (Movies,  cat 3)         → 301
 *   31000 (Consoles,cat 4)         → 401
 *   42000 (Games,   cat 4)         → 402
 *   43000 (Computers,cat 4)        → 403
 *   44000 (Printers, cat 4)        → 404
 *   45000 (TVs,      cat 4)        → 405
 *   46000 (Mobiles,  cat 4)        → 406
 *   51000 (Home Furniture, cat 5)  → 501
 *
 * Data inconsistencies to fix (items with wrong category_id):
 *   id=81  XBOX One:          cat 3 → 4  (stays subcat 31000→401)
 *   id=91  Nintendo Switch:   cat 3 → 4  (stays subcat 31000→401)
 *   id=92  Curriculum:        cat 2, subcat 41000 → subcat 201 (Books)
 *   id=93  Curriculum:        cat 2, subcat 41000 → subcat 201 (Books)
 *   id=94  Curriculum Vitae:  cat 1, subcat 41000 → cat 2, subcat 201 (Books/Books)
 *
 * Run:  node scripts/stage13-subcategory-ids.js [--dry-run]
 */

const https = require('https');

const API_KEY = 'a480e8f0-0dd2-4704-9405-166af230ac30';
const BASE = 'stuffie-2u0v.api.codehooks.io';
const DRY_RUN = process.argv.includes('--dry-run');

// ─── ID mapping ──────────────────────────────────────────────────────────────
const SUBCAT_ID_MAP = {
  11000: 101,
  21000: 201,
  41000: 301,
  31000: 401,
  42000: 402,
  43000: 403,
  44000: 404,
  45000: 405,
  46000: 406,
  51000: 501,
};

// Items that need their category_id fixed in addition to subcategory_id
const ITEM_CATEGORY_FIXES = {
  81: 4,   // XBOX One: cat 3 → 4
  91: 4,   // Nintendo Switch: cat 3 → 4
  94: 2,   // Curriculum Vitae: cat 1 → 2
};

// Items whose subcategory should override the standard SUBCAT_ID_MAP lookup
// (data inconsistency: tagged with a subcat from the wrong category)
const ITEM_SUBCAT_OVERRIDES = {
  92: 201,  // Curriculum: was 41000 (Movies) → should be 201 (Books)
  93: 201,  // Curriculum: was 41000 (Movies) → should be 201 (Books)
  94: 201,  // Curriculum Vitae: was 41000 (Movies) → should be 201 (Books)
};

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: BASE,
      path: `/dev/${path}`,
      method,
      headers: { 'x-apikey': API_KEY, 'Content-Type': 'application/json' },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no writes\n' : '🚀 LIVE RUN — writing to DB\n');

  // ── 1. Load all subcategories ───────────────────────────────────────────────
  const subcats = await request('GET', 'subcategories?limit=100');
  console.log(`Loaded ${subcats.length} subcategories`);

  // ── 2. Update subcategory IDs ──────────────────────────────────────────────
  console.log('\n── Subcategory ID updates ──');
  for (const sc of subcats) {
    const newId = SUBCAT_ID_MAP[sc.id];
    if (!newId) {
      console.log(`  SKIP  id=${sc.id} "${sc.name}" — not in mapping`);
      continue;
    }
    if (sc.id === newId) {
      console.log(`  SAME  id=${sc.id} "${sc.name}" — already correct`);
      continue;
    }
    console.log(`  UPDATE subcategory _id=${sc._id} "${sc.name}": id ${sc.id} → ${newId}`);
    if (!DRY_RUN) {
      await request('PUT', `subcategories/${sc._id}`, { ...sc, id: newId });
    }
  }

  // ── 3. Load all items ──────────────────────────────────────────────────────
  const items = await request('GET', 'items?limit=100');
  console.log(`\nLoaded ${items.length} items`);

  // ── 4. Update item subcategory_id (and fix category_id where needed) ───────
  console.log('\n── Item updates ──');
  let updated = 0, already = 0;
  for (const item of items) {
    const newSubcatId = ITEM_SUBCAT_OVERRIDES[item.id] ?? SUBCAT_ID_MAP[item.subcategory_id];
    const newCatId = ITEM_CATEGORY_FIXES[item.id] ?? item.category_id;
    const subcatChanged = newSubcatId !== undefined && newSubcatId !== item.subcategory_id;
    const catChanged = newCatId !== item.category_id;

    if (!subcatChanged && !catChanged) {
      console.log(`  SAME  id=${item.id} "${item.name}" cat=${item.category_id} subcat=${item.subcategory_id}`);
      already++;
      continue;
    }

    const appliedSubcat = newSubcatId ?? item.subcategory_id;
    console.log(`  UPDATE id=${item.id} "${item.name}": cat ${item.category_id}→${newCatId}, subcat ${item.subcategory_id}→${appliedSubcat}`);
    if (!DRY_RUN) {
      await request('PUT', `items/${item._id}`, {
        ...item,
        category_id: newCatId,
        subcategory_id: appliedSubcat,
      });
    }
    updated++;
  }

  console.log(`\n✅ Done. ${updated} items updated, ${already} already correct.`);
  if (DRY_RUN) console.log('   (dry run — nothing written)');
}

main().catch(e => { console.error(e); process.exit(1); });

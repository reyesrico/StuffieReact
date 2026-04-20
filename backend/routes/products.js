/**
 * Product / inventory routes
 *
 *   GET  /userproducts/:stuffierId — server-side user_items + items join
 *   POST /items/next-id            — atomic item ID counter
 *   POST /stuff/next-id            — alias for /items/next-id
 *   POST /stuffiers/next-id        — legacy alias (user counter)
 *   POST /users/next-id            — atomic user ID counter
 */
import { app, datastore } from 'codehooks-js';
import { requireAuth } from '../lib/jwt.js';

// ---------------------------------------------------------------------------
// Atomic ID counters
// Self-seeding: reads DB max on first call so it's always safe to deploy
// without a separate migration step.
// ---------------------------------------------------------------------------
const getNextId = async (db, counterKey, collection) => {
  const raw = await db.get(counterKey).catch(() => null);
  if (raw === null || raw === undefined) {
    const ids = [];
    await db.getMany(collection, {}).forEach(r => { if (r.id != null) ids.push(Number(r.id)); });
    const seed = ids.length > 0 ? Math.max(...ids) : 0;
    await db.set(counterKey, String(seed));
  }
  return db.incr(counterKey, 1);
};

app.post('/items/next-id', async (req, res) => {
  const db = await datastore.open();
  return res.json({ id: await getNextId(db, 'counter_stuff_id', 'items') });
});

app.post('/stuff/next-id', async (req, res) => {
  const db = await datastore.open();
  return res.json({ id: await getNextId(db, 'counter_stuff_id', 'items') });
});

app.post('/stuffiers/next-id', async (req, res) => {
  const db = await datastore.open();
  return res.json({ id: await getNextId(db, 'counter_users_id', 'users') });
});

app.post('/users/next-id', async (req, res) => {
  const db = await datastore.open();
  return res.json({ id: await getNextId(db, 'counter_users_id', 'users') });
});

// ---------------------------------------------------------------------------
// GET /userproducts/:stuffierId
// Server-side join: user_items → items (replaces 3-call client pipeline)
// Must be registered BEFORE crudlify() to avoid wildcard shadowing.
// ---------------------------------------------------------------------------
app.get('/userproducts/:stuffierId', requireAuth, async (req, res) => {
  const stuffierId = Number(req.params.stuffierId);
  if (!stuffierId || isNaN(stuffierId)) {
    return res.status(400).json({ error: 'Invalid stuffierId' });
  }

  try {
    const db = await datastore.open();

    const ssRows = [];
    await db.getMany('user_items', { user_id: stuffierId }).forEach(row => ssRows.push(row));
    if (ssRows.length === 0) return res.json([]);

    const stuffIds = ssRows.map(r => r.item_id).filter(Boolean);
    const stuffMap = {};
    await db.getMany('items', { id: { $in: stuffIds } }).forEach(row => { stuffMap[row.id] = row; });

    const result = ssRows
      .map(ss => {
        const product = stuffMap[ss.item_id];
        if (!product) return null;
        return { ...product, cost: ss.asking_price ?? null, ss_id: ss._id, quantity: ss.quantity ?? 1 };
      })
      .filter(Boolean);

    return res.json(result);
  } catch (err) {
    console.error('userproducts error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

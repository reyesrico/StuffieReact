/**
 * User routes
 *   GET  /users          — list users (password_hash stripped)
 *   GET  /users/:id      — single user (password_hash stripped)
 *   PATCH /users/:id     — partial profile update (whitelisted fields only)
 *
 * SEC-API middleware is also registered here: it gates all sensitive
 * collections with requireAuth, while leaving public catalog routes open.
 */
import { app, datastore } from 'codehooks-js';
import { requireAuth } from '../lib/jwt.js';

// ---------------------------------------------------------------------------
// SEC-API middleware — must run before crudlify()
// ---------------------------------------------------------------------------
const SENSITIVE_COLLECTIONS = new Set([
  'users', 'user_items', 'friendships',
  'exchange_requests', 'loan_requests', 'purchase_requests',
  'push_subscriptions', // never expose subscriptions via raw crudlify
]);

app.use((req, res, next) => {
  const collection = req.path.split('/').filter(Boolean)[0];
  if (!SENSITIVE_COLLECTIONS.has(collection)) return next();
  // Allow POST /users for registration — no token exists yet
  if (collection === 'users' && req.method === 'POST') return next();
  return requireAuth(req, res, next);
});

// ---------------------------------------------------------------------------
// Sanitised reads — strip password_hash before returning
// Registered BEFORE crudlify() so these handlers take priority
// ---------------------------------------------------------------------------
const sanitizeUser = ({ password_hash: _pw, ...safe }) => safe;

app.get('/users', async (req, res) => {
  try {
    const db = await datastore.open();
    const filter = req.query.q ? JSON.parse(String(req.query.q)) : {};
    const results = [];
    await db.getMany('users', filter).forEach(u => results.push(sanitizeUser(u)));
    return res.json(results);
  } catch (err) {
    console.error('GET /users error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const db = await datastore.open();
    const results = [];
    await db.getMany('users', { _id: req.params.id }).forEach(u => results.push(sanitizeUser(u)));
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(results[0]);
  } catch (err) {
    console.error('GET /users/:id error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /users/:id — partial profile update
// Whitelisted fields prevent injection of privileged fields (is_admin, etc.)
// ---------------------------------------------------------------------------
const USER_PATCH_ALLOWED = ['first_name', 'last_name', 'picture', 'zip_code', 'lat', 'lng', 'password_hash'];

app.patch('/users/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const db = await datastore.open();

    // Users can only patch their own record; admins can patch any
    if (req.user.role !== 'admin') {
      const targets = [];
      await db.getMany('users', { _id: id }).forEach(u => targets.push(u));
      const target = targets[0];
      if (!target || target.id !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const updates = {};
    for (const key of USER_PATCH_ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db.updateOne('users', { _id: id }, { $set: updates });
    return res.json(updates);
  } catch (err) {
    console.error('PATCH /users/:id error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

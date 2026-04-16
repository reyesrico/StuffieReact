/**
 * Admin routes — all require role: 'admin' in JWT.
 *
 *   GET    /admin/orphans           — list user_items rows with invalid refs
 *   DELETE /admin/orphans/:id       — delete a single orphan row
 *
 *   GET    /subcategory_proposals         — list proposals (filter by status)
 *   POST   /subcategory_proposals         — user submits a new proposal
 *   PATCH  /subcategory_proposals/:id/approve — admin approves + creates subcategory
 *   PATCH  /subcategory_proposals/:id/reject  — admin rejects with optional note
 */
import { app, datastore } from 'codehooks-js';
import { requireAuth } from '../lib/jwt.js';

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// ---------------------------------------------------------------------------
// Orphan row detection
// ---------------------------------------------------------------------------
app.get('/admin/orphans', requireAuth, adminOnly, async (req, res) => {
  try {
    const db = await datastore.open();

    const itemIds = new Set();
    await db.getMany('items', {}).forEach(r => { if (r.id != null) itemIds.add(Number(r.id)); });

    const userIds = new Set();
    await db.getMany('users', {}).forEach(r => { if (r.id != null) userIds.add(Number(r.id)); });

    const orphans = [];
    await db.getMany('user_items', {}).forEach(r => {
      const itemOk = itemIds.has(Number(r.item_id));
      const userOk = userIds.has(Number(r.user_id));
      if (!itemOk || !userOk) {
        orphans.push({ ...r, _reason: !userOk ? 'unknown_user' : 'unknown_item' });
      }
    });

    return res.json({ orphans, totalChecked: itemIds.size + userIds.size });
  } catch (err) {
    console.error('GET /admin/orphans error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/admin/orphans/:id', requireAuth, adminOnly, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const db = await datastore.open();
    await db.deleteOne('user_items', { _id: id });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /admin/orphans/:id error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Subcategory proposals
// ---------------------------------------------------------------------------
app.get('/subcategory_proposals', requireAuth, adminOnly, async (req, res) => {
  try {
    const db = await datastore.open();
    const { status } = req.query ?? {};
    const results = [];
    await db.getMany('subcategory_proposals', status ? { status } : {}).forEach(r => results.push(r));
    results.sort((a, b) => (b._created ?? '').localeCompare(a._created ?? ''));
    return res.json(results);
  } catch (err) {
    console.error('GET /subcategory_proposals error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/subcategory_proposals', requireAuth, async (req, res) => {
  const { name, category_id } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!category_id || !Number.isInteger(Number(category_id))) {
    return res.status(400).json({ error: 'category_id is required' });
  }
  try {
    const db = await datastore.open();
    const result = await db.insertOne('subcategory_proposals', {
      name: name.trim(),
      category_id: Number(category_id),
      proposed_by: req.user.sub,
      proposed_by_id: req.user.userId,
      status: 'pending',
      admin_note: '',
      _created: new Date().toISOString(),
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error('POST /subcategory_proposals error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/subcategory_proposals/:id/approve', requireAuth, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await datastore.open();
    const rows = [];
    await db.getMany('subcategory_proposals', { _id: id }).forEach(r => rows.push(r));
    const proposal = rows[0];
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.status !== 'pending') return res.status(409).json({ error: 'Already reviewed' });

    const catBase  = Number(proposal.category_id) * 100;
    const existing = [];
    await db.getMany('subcategories', { category_id: proposal.category_id }).forEach(r => existing.push(r));
    const maxId = existing.reduce((m, s) => Math.max(m, Number(s.id) || 0), catBase);
    const newId = maxId + 1;

    await db.insertOne('subcategories', {
      id: newId,
      name: proposal.name,
      category_id: proposal.category_id,
      _created: new Date().toISOString(),
    });
    await db.updateOne('subcategory_proposals', { _id: id }, {
      $set: { status: 'approved', admin_note: req.body?.admin_note ?? '' },
    });
    return res.json({ success: true, subcategory_id: newId });
  } catch (err) {
    console.error('PATCH /subcategory_proposals/:id/approve error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/subcategory_proposals/:id/reject', requireAuth, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await datastore.open();
    await db.updateOne('subcategory_proposals', { _id: id }, {
      $set: { status: 'rejected', admin_note: req.body?.admin_note ?? '' },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('PATCH /subcategory_proposals/:id/reject error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

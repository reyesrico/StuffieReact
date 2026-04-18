/**
 * Push notification routes
 *
 *   POST   /push-subscribe   — save (or upsert) a Web Push subscription for the
 *                              current JWT-authenticated user
 *   DELETE /push-subscribe   — remove the subscription on logout
 */
import { app, datastore } from 'codehooks-js';
import { requireAuth } from '../lib/jwt.js';

// ---------------------------------------------------------------------------
// POST /push-subscribe — save subscription
// ---------------------------------------------------------------------------
app.post('/push-subscribe', requireAuth, async (req, res) => {
  const { subscription } = req.body ?? {};

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'subscription.endpoint is required' });
  }

  try {
    const db = await datastore.open();
    const existing = [];
    await db.getMany('push_subscriptions', { user_id: req.user.userId }).forEach(s => existing.push(s));

    if (existing[0]?._id) {
      // Upsert — endpoint may have rotated
      await db.updateOne('push_subscriptions', { _id: existing[0]._id }, { $set: { subscription } });
    } else {
      await db.insertOne('push_subscriptions', {
        user_id: req.user.userId,
        subscription,
        created_at: new Date().toISOString(),
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('POST /push-subscribe error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /push-subscribe — remove subscription
// ---------------------------------------------------------------------------
app.delete('/push-subscribe', requireAuth, async (req, res) => {
  try {
    const db = await datastore.open();
    const subs = [];
    await db.getMany('push_subscriptions', { user_id: req.user.userId }).forEach(s => subs.push(s));

    for (const sub of subs) {
      await db.deleteOne('push_subscriptions', { _id: sub._id }).catch(() => {});
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /push-subscribe error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

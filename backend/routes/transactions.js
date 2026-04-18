/**
 * Transaction routes — create + accept / complete flows for all three request types.
 *
 *   POST /exchange_requests               — create + push-notify item owner
 *   POST /loan_requests                   — create + push-notify item owner
 *   POST /purchase_requests               — create + push-notify seller
 *   POST /friendships                     — create + push-notify target user
 *   POST /loan_requests/:id/accept        — approve loan, mark item on_loan
 *   POST /loan_requests/:id/complete      — confirm return, clear on_loan flags
 *   POST /purchase_requests/:id/complete  — transfer item ownership
 *   POST /exchange_requests/:id/complete  — swap item ownership between users
 */
import { app, datastore } from 'codehooks-js';
import { requireAuth } from '../lib/jwt.js';
import { sendPushToUser } from '../lib/push.js';

// ---------------------------------------------------------------------------
// POST /exchange_requests — create request + notify item owner
// Overrides crudlify generic POST so we can fire a push notification.
// req.user is already set by the SEC-API middleware in users.js.
// ---------------------------------------------------------------------------
app.post('/exchange_requests', async (req, res) => {
  const data = req.body ?? {};
  if (!data.id_stuffier || !data.id_stuff || !data.id_friend || !data.id_friend_stuff) {
    return res.status(400).json({ error: 'id_stuffier, id_stuff, id_friend, id_friend_stuff are required' });
  }
  try {
    const db     = await datastore.open();
    const record = await db.insertOne('exchange_requests', { ...data, status: data.status || 'pending' });
    // Notify the item owner (id_friend) — their item is being requested
    sendPushToUser(db, data.id_friend, {
      title: 'New trade request on Stuffie',
      body:  'Someone wants to trade one of your items.',
    }).catch(() => {});
    return res.json(record);
  } catch (err) {
    console.error('POST /exchange_requests error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /loan_requests — create request + notify item owner
// ---------------------------------------------------------------------------
app.post('/loan_requests', async (req, res) => {
  const data = req.body ?? {};
  if (!data.id_stuffier || !data.id_stuff || !data.id_friend) {
    return res.status(400).json({ error: 'id_stuffier, id_stuff, id_friend are required' });
  }
  try {
    const db     = await datastore.open();
    const record = await db.insertOne('loan_requests', { ...data, status: data.status || 'pending' });
    // Notify the item owner (id_friend) — they're being asked to lend
    sendPushToUser(db, data.id_friend, {
      title: 'New borrow request on Stuffie',
      body:  'Someone wants to borrow one of your items.',
    }).catch(() => {});
    return res.json(record);
  } catch (err) {
    console.error('POST /loan_requests error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /purchase_requests — create request + notify seller
// ---------------------------------------------------------------------------
app.post('/purchase_requests', async (req, res) => {
  const data = req.body ?? {};
  if (!data.id_stuffier || !data.id_stuff || !data.id_friend) {
    return res.status(400).json({ error: 'id_stuffier, id_stuff, id_friend are required' });
  }
  try {
    const db     = await datastore.open();
    const record = await db.insertOne('purchase_requests', { ...data, status: data.status || 'pending' });
    // Notify the seller (id_stuffier) — someone wants to buy their item
    sendPushToUser(db, data.id_stuffier, {
      title: 'New buy request on Stuffie',
      body:  'Someone wants to buy one of your items.',
    }).catch(() => {});
    return res.json(record);
  } catch (err) {
    console.error('POST /purchase_requests error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /friendships — create friendship record + notify target
// Pending records: user_id = target, friend_id = sender, status = 'pending'
// Accepted reverse records (status = 'accepted') are silent — no notification.
// ---------------------------------------------------------------------------
app.post('/friendships', async (req, res) => {
  const data = req.body ?? {};
  try {
    const db     = await datastore.open();
    const record = await db.insertOne('friendships', { ...data });
    if (data.status === 'pending' && data.user_id) {
      // Notify the target user (user_id) — they received a friend request
      sendPushToUser(db, data.user_id, {
        title: 'New friend request on Stuffie',
        body:  'Someone wants to connect with you.',
      }).catch(() => {});
    }
    return res.json(record);
  } catch (err) {
    console.error('POST /friendships error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Helper — fetch one row from a collection by _id
// ---------------------------------------------------------------------------
const findOne = async (db, collection, id) => {
  const rows = [];
  await db.getMany(collection, { _id: id }).forEach(r => rows.push(r));
  return rows[0] ?? null;
};

// ---------------------------------------------------------------------------
// Helper — fetch one user_item row by user + item
// ---------------------------------------------------------------------------
const findUserItem = async (db, userId, itemId) => {
  const rows = [];
  await db.getMany('user_items', { user_id: userId, item_id: itemId }).forEach(r => rows.push(r));
  return rows[0] ?? null;
};

// ---------------------------------------------------------------------------
// Helper — decrement qty or delete a user_items row
// ---------------------------------------------------------------------------
const decrementOrDelete = async (db, row) => {
  const qty = row.quantity ?? 1;
  if (qty > 1) {
    await db.updateOne('user_items', { _id: row._id }, { $set: { quantity: qty - 1 } });
  } else {
    await db.deleteOne('user_items', { _id: row._id });
  }
};

// ---------------------------------------------------------------------------
// Helper — increment qty or insert a new user_items row
// ---------------------------------------------------------------------------
const incrementOrInsert = async (db, userId, itemId, askingPrice) => {
  const existing = await findUserItem(db, userId, itemId);
  if (existing) {
    await db.updateOne('user_items', { _id: existing._id }, { $set: { quantity: (existing.quantity ?? 1) + 1 } });
  } else {
    await db.insertOne('user_items', { user_id: userId, item_id: itemId, asking_price: askingPrice, quantity: 1 });
  }
};

// ---------------------------------------------------------------------------
// POST /loan_requests/:id/accept
// ---------------------------------------------------------------------------
app.post('/loan_requests/:id/accept', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db      = await datastore.open();
    const loanReq = await findOne(db, 'loan_requests', requestId);
    if (!loanReq) return res.status(404).json({ error: 'Loan request not found' });

    const item = await findUserItem(db, loanReq.id_stuffier, loanReq.id_stuff);
    if (item?._id) {
      await db.updateOne('user_items', { _id: item._id }, {
        $set: { on_loan: true, loaned_to: loanReq.id_friend, loan_request_id: loanReq._id },
      });
    }

    await db.updateOne('loan_requests', { _id: requestId }, { $set: { status: 'active' } });
    return res.json({ success: true });
  } catch (err) {
    console.error('loan_requests/accept error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /loan_requests/:id/complete  — owner confirms item returned
// ---------------------------------------------------------------------------
app.post('/loan_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db      = await datastore.open();
    const loanReq = await findOne(db, 'loan_requests', requestId);
    if (!loanReq) return res.status(404).json({ error: 'Loan request not found' });
    if (!['active', 'return_requested'].includes(loanReq.status)) {
      return res.status(409).json({ error: 'Loan must be active or return_requested to complete' });
    }

    const ownerRow = await findUserItem(db, loanReq.id_stuffier, loanReq.id_stuff);
    if (ownerRow?._id) {
      await db.updateOne('user_items', { _id: ownerRow._id }, {
        $set: { on_loan: false, loaned_to: null, loan_request_id: null },
      });
    }

    await db.updateOne('loan_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: new Date().toISOString() },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('loan_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /purchase_requests/:id/complete  — transfer item to buyer
// ---------------------------------------------------------------------------
app.post('/purchase_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db   = await datastore.open();
    const req_ = await findOne(db, 'purchase_requests', requestId);
    if (!req_) return res.status(404).json({ error: 'Purchase request not found' });
    if (req_.status !== 'accepted') {
      return res.status(409).json({ error: 'Request must be accepted before completing' });
    }

    const { id_stuffier: sellerId, id_friend: buyerId, id_stuff: itemId, cost } = req_;

    const sellerRow = await findUserItem(db, sellerId, itemId);
    if (sellerRow) await decrementOrDelete(db, sellerRow);

    await incrementOrInsert(db, buyerId, itemId, cost ?? null);

    await db.updateOne('purchase_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: new Date().toISOString() },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('purchase_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /exchange_requests/:id/complete  — swap items between both users
// ---------------------------------------------------------------------------
app.post('/exchange_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db    = await datastore.open();
    const exReq = await findOne(db, 'exchange_requests', requestId);
    if (!exReq) return res.status(404).json({ error: 'Exchange request not found' });
    if (exReq.status !== 'accepted') {
      return res.status(409).json({ error: 'Request must be accepted before completing' });
    }

    const userA = exReq.id_friend;       // requester (offered itemX)
    const itemX = exReq.id_friend_stuff;
    const userB = exReq.id_stuffier;     // owner (offered itemY)
    const itemY = exReq.id_stuff;

    const aRowX = await findUserItem(db, userA, itemX);
    const bRowY = await findUserItem(db, userB, itemY);

    const priceX = aRowX?.asking_price ?? null;
    const priceY = bRowY?.asking_price ?? null;

    // Remove X from A, give Y to A
    if (aRowX) await decrementOrDelete(db, aRowX);
    await incrementOrInsert(db, userA, itemY, priceY);

    // Remove Y from B, give X to B
    if (bRowY) await decrementOrDelete(db, bRowY);
    await incrementOrInsert(db, userB, itemX, priceX);

    await db.updateOne('exchange_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: new Date().toISOString() },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('exchange_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

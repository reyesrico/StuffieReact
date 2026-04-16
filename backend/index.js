/**
 * Stuffie — Codehooks serverless functions
 * Deploy: cd backend && codehooks deploy
 * Set key: codehooks set-env --projectname stuffie-2u0v --space dev --key OPENAI_API_KEY --value sk-... --encrypted
 *
 * OPENAI_API_KEY lives only in Codehooks env vars — never in source code or git.
 *
 * ENV VARS REQUIRED:
 *   JWT_ACCESS_TOKEN_SECRET  — random 256-bit secret for HS256 signing
 *     Set once: coho set-env --projectname stuffie-2u0v --space dev --key JWT_ACCESS_TOKEN_SECRET --value <secret> --encrypted
 */
import { app, datastore } from 'codehooks-js';
import { createHmac, createHash, pbkdf2Sync, randomBytes } from 'crypto';

// =============================================================================
// JWT helpers — HS256, 1-hour access tokens, no external deps
// =============================================================================

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

const signJWT = (payload) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_TOKEN_SECRET env var is not set');
  const header  = b64url({ alg: 'HS256', typ: 'JWT' });
  const now     = Math.floor(Date.now() / 1000);
  const claims  = b64url({ ...payload, iat: now, exp: now + 3600 }); // 1 hour
  const sig     = createHmac('sha256', secret).update(`${header}.${claims}`).digest('base64url');
  return `${header}.${claims}.${sig}`;
};

const verifyJWT = (token) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, claims, sig] = parts;
  const expected = createHmac('sha256', secret).update(`${header}.${claims}`).digest('base64url');
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
};

// =============================================================================
// requireAuth middleware — validates Bearer JWT, attaches req.user
// Returns 401 if missing/invalid/expired
// =============================================================================
const requireAuth = (req, res, next) => {
  const token = req.headers?.['x-stuffie-auth'] || null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload; // { sub, userId, role, iat, exp }
  next();
};

// =============================================================================
// Password verification — supports all 3 stored formats
// =============================================================================

/**
 * verifyPassword — returns { valid: boolean, needsUpgrade: boolean }
 *   v2:<hexSalt>:<hexHash>  PBKDF2-HMAC-SHA256, 600k iters  (current)
 *   64-char hex             PBKDF2-HMAC-SHA1,    1k iters   (legacy CryptoJS default)
 *   64-char hex             SHA256                           (oldest fallback)
 */
const verifyPassword = (password, storedHash, email) => {
  if (!storedHash) return { valid: false, needsUpgrade: false };

  // v2 format
  if (storedHash.startsWith('v2:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return { valid: false, needsUpgrade: false };
    const [, hexSalt, hexStored] = parts;
    const computed = pbkdf2Sync(password, Buffer.from(hexSalt, 'hex'), 600_000, 32, 'sha256').toString('hex');
    return { valid: computed === hexStored, needsUpgrade: false };
  }

  // Legacy PBKDF2 (CryptoJS v4 default = HMAC-SHA256, email as salt)
  const legacyHash = pbkdf2Sync(password, email, 1_000, 32, 'sha256').toString('hex');
  if (legacyHash === storedHash) return { valid: true, needsUpgrade: true };

  // Oldest fallback — raw SHA256
  const sha256 = createHash('sha256').update(password).digest('hex');
  if (sha256 === storedHash) return { valid: true, needsUpgrade: true };

  return { valid: false, needsUpgrade: false };
};

// =============================================================================
// POST /auth/login — server-side auth, returns HS256 JWT (1 hour)
// Body: { email: string, password: string }
// Returns: { user: SafeUser, accessToken: string, expiresAt: number }
// Rate limiting: 5 failures within 15 min → 429. Uses Codehooks KV store.
// =============================================================================

const RL_WINDOW   = 15 * 60; // 15 minutes in seconds
const RL_MAX_FAIL = 5;

const rlKey = (email) => `rl:login:${email.toLowerCase().trim()}`;

const getRateLimit = async (db, email) => {
  try {
    const raw = await db.get(rlKey(email));
    if (!raw) return { count: 0, resetAt: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, resetAt: 0 };
  }
};

const setRateLimit = async (db, email, data) => {
  await db.set(rlKey(email), JSON.stringify(data));
};

const clearRateLimit = async (db, email) => {
  // Reset to zero — Codehooks KV has no delete method; setting count:0 is equivalent
  await db.set(rlKey(email), JSON.stringify({ count: 0, resetAt: 0 })).catch(() => {});
};

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const db = await datastore.open();
    const now = Math.floor(Date.now() / 1000);

    // --- Rate limit check ---
    const rl = await getRateLimit(db, email);
    if (rl.count >= RL_MAX_FAIL && rl.resetAt > now) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again later.',
        retryAfterSeconds: rl.resetAt - now,
      });
    }

    // getMany with flat MongoDB query + forEach — the documented Codehooks pattern
    const users = [];
    await db.getMany('users', { email }).forEach(u => users.push(u));
    const user = users[0];

    // Constant-time-safe message — don't reveal whether email exists
    if (!user) {
      const newCount = rl.resetAt > now ? rl.count + 1 : 1;
      const resetAt  = rl.resetAt > now ? rl.resetAt : now + RL_WINDOW;
      await setRateLimit(db, email, { count: newCount, resetAt });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { valid, needsUpgrade } = verifyPassword(password, user.password_hash, email);
    if (!valid) {
      const newCount = rl.resetAt > now ? rl.count + 1 : 1;
      const resetAt  = rl.resetAt > now ? rl.resetAt : now + RL_WINDOW;
      await setRateLimit(db, email, { count: newCount, resetAt });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login — clear any failure counter
    await clearRateLimit(db, email);

    // Auto-upgrade old hash to v2 — fire and forget, don't block response
    if (needsUpgrade && user._id) {
      const salt   = randomBytes(16);
      const hash   = pbkdf2Sync(password, salt, 600_000, 32, 'sha256').toString('hex');
      const v2Hash = `v2:${salt.toString('hex')}:${hash}`;
      db.updateOne('users', { _id: user._id }, { $set: { password_hash: v2Hash } }).catch(() => {});
    }

    // Strip sensitive fields before returning
    const { password_hash: _pw, ...safeUser } = user;

    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const accessToken = signJWT({
      sub:    email,
      userId: user.id,
      role:   user.is_admin ? 'admin' : 'user',
    });

    return res.json({ user: safeUser, accessToken, expiresAt });
  } catch (err) {
    console.error('auth/login error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Allowlist of models — prevents clients from calling expensive models
const ALLOWED_MODELS = ['gpt-5-nano', 'gpt-4.1-nano'];
const DEFAULT_MODEL  = 'gpt-5-nano';

/**
 * POST /ai-chat
 * Body: { model: string, messages: {role,content}[], systemPrompt: string }
 * Returns: { content: string, total_tokens: number }
 */
app.post('/ai-chat', async (req, res) => {
  const { model, messages, systemPrompt } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const safeModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: safeModel,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: String(systemPrompt) }] : []),
        ...messages,
      ],
    }),
  });

  if (!openaiRes.ok) {
    // Do NOT forward raw OpenAI error — may contain internal details
    return res.status(openaiRes.status).json({ error: `AI request failed (${openaiRes.status})` });
  }

  const data = await openaiRes.json();
  return res.json({
    content:      data.choices?.[0]?.message?.content ?? '',
    total_tokens: data.usage?.total_tokens ?? 0,
  });
});

// =============================================================================
// Atomic ID counters — replaces unsafe client-side Math.max pattern
// POST /items/next-id     → { id: <next integer> }
// POST /stuff/next-id     → alias for /items/next-id
// POST /stuffiers/next-id → legacy alias (user counter)
// POST /users/next-id     → { id: <next integer> }  (P1: canonical user id source)
//
// Uses Codehooks keyvalue store as an atomic counter so concurrent requests
// never generate duplicate numeric IDs.
//
// Self-seeding: on first call the counter is seeded from the current DB max so
// it is always safe to deploy without a separate migration step.
// =============================================================================

/**
 * getNextId — atomic, self-seeding counter.
 * Reads DB max on very first call (counter key absent) to avoid colliding with
 * existing records, then uses KV incr for all subsequent calls.
 */
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
  const id = await getNextId(db, 'counter_stuff_id', 'items');
  return res.json({ id });
});

app.post('/stuff/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await getNextId(db, 'counter_stuff_id', 'items');
  return res.json({ id });
});

app.post('/stuffiers/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await getNextId(db, 'counter_users_id', 'users');
  return res.json({ id });
});

app.post('/users/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await getNextId(db, 'counter_users_id', 'users');
  return res.json({ id });
});

// =============================================================================
// Server-side user products join — replaces 3-call client pipeline
// GET /userproducts/:stuffierId
//   1. Fetches user_items rows for this user
//   2. Batch-fetches matching items rows
//   3. Merges cost onto each product
//   Returns: Array<Product & { cost: number, ss_id: string }>
//
// IMPORTANT: must be registered BEFORE app.crudlify() — crudlify registers a
// wildcard /:collection/:id route that would otherwise intercept this path.
// =============================================================================

app.get('/userproducts/:stuffierId', requireAuth, async (req, res) => {
  const stuffierId = Number(req.params.stuffierId);
  if (!stuffierId || isNaN(stuffierId)) {
    return res.status(400).json({ error: 'Invalid stuffierId' });
  }

  try {
    const db = await datastore.open();

    // 1. Get ownership rows — forEach is the documented cursor iteration method
    const ssRows = [];
    await db.getMany('user_items', { user_id: stuffierId }).forEach(row => ssRows.push(row));

    if (ssRows.length === 0) return res.json([]);

    // 2. Get matching item rows
    const stuffIds = ssRows.map(r => r.item_id).filter(Boolean);
    const stuffMap = {};
    await db.getMany('items', { id: { $in: stuffIds } }).forEach(row => { stuffMap[row.id] = row; });

    // 3. Merge
    const result = ssRows
      .map(ss => {
        const product = stuffMap[ss.item_id];
        if (!product) return null;
        return { ...product, cost: ss.asking_price ?? null, ss_id: ss._id };
      })
      .filter(Boolean);

    return res.json(result);
  } catch (err) {
    console.error('userproducts error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// Accept loan request — marks item as on_loan and sets status to 'active'
// POST /loan_requests/:id/accept
// =============================================================================

app.post('/loan_requests/:id/accept', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    const db = await datastore.open();

    const requests = [];
    await db.getMany('loan_requests', { _id: requestId }).forEach(r => requests.push(r));
    const loanReq = requests[0];
    if (!loanReq) return res.status(404).json({ error: 'Loan request not found' });

    // Mark the owner's user_items row as on_loan
    // id_stuffier = owner (lender), id_friend = borrower
    const items = [];
    await db.getMany('user_items', { user_id: loanReq.id_stuffier, item_id: loanReq.id_stuff }).forEach(r => items.push(r));
    const item = items[0];
    if (item?._id) {
      await db.updateOne('user_items', { _id: item._id }, {
        $set: { on_loan: true, loaned_to: loanReq.id_friend, loan_request_id: loanReq._id },
      });
    }

    // Set status to 'active'
    await db.updateOne('loan_requests', { _id: requestId }, { $set: { status: 'active' } });

    return res.json({ success: true });
  } catch (err) {
    console.error('loan_requests/accept error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// Complete purchase request — transfers item ownership from seller to buyer
// POST /purchase_requests/:id/complete
// =============================================================================

app.post('/purchase_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await datastore.open();

    const requests = [];
    await db.getMany('purchase_requests', { _id: requestId }).forEach(r => requests.push(r));
    const req_ = requests[0];
    if (!req_) return res.status(404).json({ error: 'Purchase request not found' });
    if (req_.status !== 'accepted') return res.status(409).json({ error: 'Request must be accepted before completing' });

    const sellerId = req_.id_stuffier;
    const buyerId  = req_.id_friend;
    const itemId   = req_.id_stuff;
    const cost     = req_.cost ?? null;

    // 1. Seller's row — decrement or delete
    const sellerItems = [];
    await db.getMany('user_items', { user_id: sellerId, item_id: itemId }).forEach(r => sellerItems.push(r));
    const sellerRow = sellerItems[0];
    if (sellerRow) {
      const qty = sellerRow.quantity ?? 1;
      if (qty > 1) {
        await db.updateOne('user_items', { _id: sellerRow._id }, { $set: { quantity: qty - 1 } });
      } else {
        await db.deleteOne('user_items', { _id: sellerRow._id });
      }
    }

    // 2. Buyer's row — increment or create
    const buyerItems = [];
    await db.getMany('user_items', { user_id: buyerId, item_id: itemId }).forEach(r => buyerItems.push(r));
    const buyerRow = buyerItems[0];
    if (buyerRow) {
      const qty = buyerRow.quantity ?? 1;
      await db.updateOne('user_items', { _id: buyerRow._id }, { $set: { quantity: qty + 1 } });
    } else {
      await db.insertOne('user_items', { user_id: buyerId, item_id: itemId, asking_price: cost, quantity: 1 });
    }

    // 3. Mark request completed
    const now = new Date().toISOString();
    await db.updateOne('purchase_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: now },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('purchase_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// Complete exchange request — swaps item ownership between both users
// POST /exchange_requests/:id/complete
// =============================================================================

app.post('/exchange_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await datastore.open();

    const requests = [];
    await db.getMany('exchange_requests', { _id: requestId }).forEach(r => requests.push(r));
    const exReq = requests[0];
    if (!exReq) return res.status(404).json({ error: 'Exchange request not found' });
    if (exReq.status !== 'accepted') return res.status(409).json({ error: 'Request must be accepted before completing' });

    const userA   = exReq.id_friend;    // requester (offered their item)
    const itemX   = exReq.id_friend_stuff; // A's item being offered
    const userB   = exReq.id_stuffier;  // owner being asked
    const itemY   = exReq.id_stuff;     // B's item being requested

    // Fetch all 4 rows
    const aItemX = []; await db.getMany('user_items', { user_id: userA, item_id: itemX }).forEach(r => aItemX.push(r));
    const bItemY = []; await db.getMany('user_items', { user_id: userB, item_id: itemY }).forEach(r => bItemY.push(r));
    const aRowX = aItemX[0];
    const bRowY = bItemY[0];

    const priceX = aRowX?.asking_price ?? null;
    const priceY = bRowY?.asking_price ?? null;

    // 3. Remove X from A
    if (aRowX) {
      const qty = aRowX.quantity ?? 1;
      if (qty > 1) {
        await db.updateOne('user_items', { _id: aRowX._id }, { $set: { quantity: qty - 1 } });
      } else {
        await db.deleteOne('user_items', { _id: aRowX._id });
      }
    }

    // 4. Add Y to A (with B's original asking_price)
    const aItemY = []; await db.getMany('user_items', { user_id: userA, item_id: itemY }).forEach(r => aItemY.push(r));
    const aRowY = aItemY[0];
    if (aRowY) {
      await db.updateOne('user_items', { _id: aRowY._id }, { $set: { quantity: (aRowY.quantity ?? 1) + 1 } });
    } else {
      await db.insertOne('user_items', { user_id: userA, item_id: itemY, asking_price: priceY, quantity: 1 });
    }

    // 5. Remove Y from B
    if (bRowY) {
      const qty = bRowY.quantity ?? 1;
      if (qty > 1) {
        await db.updateOne('user_items', { _id: bRowY._id }, { $set: { quantity: qty - 1 } });
      } else {
        await db.deleteOne('user_items', { _id: bRowY._id });
      }
    }

    // 6. Add X to B (with A's original asking_price)
    const bItemX = []; await db.getMany('user_items', { user_id: userB, item_id: itemX }).forEach(r => bItemX.push(r));
    const bRowX = bItemX[0];
    if (bRowX) {
      await db.updateOne('user_items', { _id: bRowX._id }, { $set: { quantity: (bRowX.quantity ?? 1) + 1 } });
    } else {
      await db.insertOne('user_items', { user_id: userB, item_id: itemX, asking_price: priceX, quantity: 1 });
    }

    // 7. Mark request completed
    const now = new Date().toISOString();
    await db.updateOne('exchange_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: now },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('exchange_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// Complete loan return — owner confirms item was returned, restores flags
// POST /loan_requests/:id/complete
// =============================================================================

app.post('/loan_requests/:id/complete', requireAuth, async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) return res.status(400).json({ error: 'Invalid request ID' });

  try {
    const db = await datastore.open();

    const requests = [];
    await db.getMany('loan_requests', { _id: requestId }).forEach(r => requests.push(r));
    const loanReq = requests[0];
    if (!loanReq) return res.status(404).json({ error: 'Loan request not found' });
    if (!['active', 'return_requested'].includes(loanReq.status)) {
      return res.status(409).json({ error: 'Loan must be active or return_requested to complete' });
    }

    // id_stuffier = owner (lender), id_friend = borrower
    const ownerId = loanReq.id_stuffier;
    const itemId  = loanReq.id_stuff;

    // Restore owner's user_items row
    const ownerItems = [];
    await db.getMany('user_items', { user_id: ownerId, item_id: itemId }).forEach(r => ownerItems.push(r));
    const ownerRow = ownerItems[0];
    if (ownerRow?._id) {
      await db.updateOne('user_items', { _id: ownerRow._id }, {
        $set: { on_loan: false, loaned_to: null, loan_request_id: null },
      });
    }

    const now = new Date().toISOString();
    await db.updateOne('loan_requests', { _id: requestId }, {
      $set: { status: 'completed', completed_at: now },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('loan_requests/complete error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// PATCH /users/:id — partial profile update via $set
// Fixes the crudlify PUT bug: PUT replaces the whole document, wiping
// password_hash when only profile fields are being updated.
// Whitelist of mutable fields prevents injection of privileged fields.
// =============================================================================

const USER_PATCH_ALLOWED = ['first_name', 'last_name', 'picture', 'zip_code', 'lat', 'lng', 'password_hash'];

app.patch('/users/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const db = await datastore.open();

    // Ownership check: user can only patch their own record; admin can patch any
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
    return res.json(updates); // echo applied fields — frontend merges onto user state
  } catch (err) {
    console.error('PATCH /users/:id error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// Admin: orphan row detection + deletion
// GET  /admin/orphans          — lists user_items rows with invalid item_id or user_id
// DELETE /admin/orphans/:id   — deletes a single orphan user_items row
// Both require admin JWT (role: 'admin')
// =============================================================================

app.get('/admin/orphans', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const db = await datastore.open();

    // Collect valid item IDs
    const itemIds = new Set();
    await db.getMany('items', {}).forEach(r => { if (r.id != null) itemIds.add(Number(r.id)); });

    // Collect valid user IDs
    const userIds = new Set();
    await db.getMany('users', {}).forEach(r => { if (r.id != null) userIds.add(Number(r.id)); });

    // Find orphaned user_items rows
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

app.delete('/admin/orphans/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

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

// =============================================================================
// Subcategory Proposals — user-submitted, admin-reviewed
// Collection: subcategory_proposals
// Schema: { name, category_id, proposed_by, proposed_by_id, status, admin_note }
// =============================================================================

// GET /subcategory_proposals?status=pending  — admin: list all or filter by status
app.get('/subcategory_proposals', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const db = await datastore.open();
    const { status } = req.query ?? {};
    const filter = status ? { status } : {};
    const results = [];
    await db.getMany('subcategory_proposals', filter).forEach(r => results.push(r));
    results.sort((a, b) => (b._created ?? '').localeCompare(a._created ?? ''));
    return res.json(results);
  } catch (err) {
    console.error('GET /subcategory_proposals error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subcategory_proposals  — authenticated user submits a proposal
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
    const proposal = {
      name: name.trim(),
      category_id: Number(category_id),
      proposed_by: req.user.sub,
      proposed_by_id: req.user.userId,
      status: 'pending',
      admin_note: '',
      _created: new Date().toISOString(),
    };
    const result = await db.insertOne('subcategory_proposals', proposal);
    return res.status(201).json(result);
  } catch (err) {
    console.error('POST /subcategory_proposals error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /subcategory_proposals/:id/approve  — admin approves + creates the subcategory
app.patch('/subcategory_proposals/:id/approve', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { id } = req.params;
  try {
    const db = await datastore.open();
    const rows = [];
    await db.getMany('subcategory_proposals', { _id: id }).forEach(r => rows.push(r));
    const proposal = rows[0];
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.status !== 'pending') return res.status(409).json({ error: 'Already reviewed' });

    // Assign next available subcategory id in the category's namespace
    const catBase = Number(proposal.category_id) * 100;
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
    await db.updateOne('subcategory_proposals', { _id: id }, { $set: { status: 'approved', admin_note: req.body?.admin_note ?? '' } });
    return res.json({ success: true, subcategory_id: newId });
  } catch (err) {
    console.error('PATCH /subcategory_proposals/:id/approve error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /subcategory_proposals/:id/reject  — admin rejects with optional note
app.patch('/subcategory_proposals/:id/reject', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
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

// =============================================================================
// SEC-API: Require JWT for all sensitive (user-data) collections.
// Any request whose first path segment matches a sensitive collection must
// carry a valid X-Stuffie-Auth Bearer token — EXCEPT:
//   POST /users          — new-user registration (no session exists yet)
//   POST /users/next-id  — atomic id counter called during registration
//                          (already handled as an explicit route above)
// Public catalog (categories, subcategories, items, conf) is left open so
// unauthenticated visitors can browse the catalog without logging in.
// =============================================================================

const SENSITIVE_COLLECTIONS = new Set([
  'users', 'user_items', 'friendships',
  'exchange_requests', 'loan_requests', 'purchase_requests',
]);

app.use((req, res, next) => {
  const collection = req.path.split('/').filter(Boolean)[0];
  if (!SENSITIVE_COLLECTIONS.has(collection)) return next();
  // Allow POST /users for registration — the user has no token yet
  if (collection === 'users' && req.method === 'POST') return next();
  return requireAuth(req, res, next);
});

// =============================================================================
// Sanitised GET /users — strip password_hash before returning.
// Registered BEFORE crudlify so these handlers take priority for user reads.
// Auth is guaranteed by the middleware above.
// =============================================================================

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

// Re-enable Codehooks auto-REST API for all collections.
// Without this line, deploying a codehooks-js function disables the built-in
// CRUD endpoints (/stuffiers, /stuff, /friends, etc.) — breaking the whole app.
// NOTE: crudlify must come AFTER all custom routes — it registers a wildcard
// /:collection/:id handler that would shadow custom paths if registered first.
// After the SEC-API middleware above, sensitive collections now require a valid
// JWT — the catalog (categories, subcategories, items, conf) remains open.
app.crudlify();

export default app.init();

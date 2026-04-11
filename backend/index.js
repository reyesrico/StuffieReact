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
// =============================================================================

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const db = await datastore.open();

    // getMany with flat MongoDB query + forEach — the documented Codehooks pattern
    const users = [];
    await db.getMany('users', { email }).forEach(u => users.push(u));
    const user = users[0];

    // Constant-time-safe message — don't reveal whether email exists
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const { valid, needsUpgrade } = verifyPassword(password, user.password_hash, email);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

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
// POST /items/next-id   → { id: <next integer> }  (Stage 12: was stuff/next-id)
// POST /stuffiers/next-id → { id: <next integer> }
//
// Uses Codehooks keyvalue store as an atomic counter so concurrent requests
// never generate duplicate numeric IDs.
// =============================================================================

app.post('/items/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await db.incr('counter_stuff_id', 1);
  return res.json({ id });
});

app.post('/stuff/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await db.incr('counter_stuff_id', 1);
  return res.json({ id });
});

app.post('/stuffiers/next-id', async (req, res) => {
  const db = await datastore.open();
  const id = await db.incr('counter_stuffiers_id', 1);
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

app.get('/userproducts/:stuffierId', async (req, res) => {
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

app.post('/loan_requests/:id/accept', async (req, res) => {
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
    const items = [];
    await db.getMany('user_items', { user_id: loanReq.id_friend, item_id: loanReq.id_stuff }).forEach(r => items.push(r));
    const item = items[0];
    if (item?._id) {
      await db.updateOne('user_items', { _id: item._id }, {
        $set: { on_loan: true, loaned_to: loanReq.id_stuffier, loan_request_id: loanReq._id },
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

// Re-enable Codehooks auto-REST API for all collections.
// Without this line, deploying a codehooks-js function disables the built-in
// CRUD endpoints (/stuffiers, /stuff, /friends, etc.) — breaking the whole app.
// NOTE: crudlify must come AFTER all custom routes — it registers a wildcard
// /:collection/:id handler that would shadow custom paths if registered first.
app.crudlify();

export default app.init();

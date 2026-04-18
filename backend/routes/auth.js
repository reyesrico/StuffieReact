/**
 * Auth routes
 *   POST /auth/login    — verify credentials, issue JWT
 *   POST /auth/refresh  — renew token for authenticated user
 */
import { app, datastore } from 'codehooks-js';
import { signJWT, signRefreshJWT, verifyRefreshJWT } from '../lib/jwt.js';
import { verifyPassword, hashPasswordV2 } from '../lib/password.js';

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

const bumpRateLimit = async (db, email, rl, now) => {
  const newCount = rl.resetAt > now ? rl.count + 1 : 1;
  const resetAt  = rl.resetAt > now ? rl.resetAt : now + RL_WINDOW;
  await db.set(rlKey(email), JSON.stringify({ count: newCount, resetAt }));
};

const clearRateLimit = async (db, email) => {
  await db.set(rlKey(email), JSON.stringify({ count: 0, resetAt: 0 })).catch(() => {});
};

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const db  = await datastore.open();
    const now = Math.floor(Date.now() / 1000);

    const rl = await getRateLimit(db, email);
    if (rl.count >= RL_MAX_FAIL && rl.resetAt > now) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again later.',
        retryAfterSeconds: rl.resetAt - now,
      });
    }

    const users = [];
    await db.getMany('users', { email }).forEach(u => users.push(u));
    const user = users[0];

    if (!user) {
      await bumpRateLimit(db, email, rl, now);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { valid, needsUpgrade } = verifyPassword(password, user.password_hash, email);
    if (!valid) {
      await bumpRateLimit(db, email, rl, now);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await clearRateLimit(db, email);

    // Auto-upgrade old hash to v2 — fire and forget
    if (needsUpgrade && user._id) {
      db.updateOne('users', { _id: user._id }, { $set: { password_hash: hashPasswordV2(password) } }).catch(() => {});
    }

    const { password_hash: _pw, ...safeUser } = user;
    const tokenPayload = { sub: email, userId: user.id, role: user.is_admin ? 'admin' : 'user' };
    const accessToken  = signJWT(tokenPayload);
    const expiresAt    = now + 3600;
    const refreshToken    = signRefreshJWT(tokenPayload);
    const refreshExpiresAt = now + 7 * 24 * 3600;

    return res.json({ user: safeUser, accessToken, expiresAt, refreshToken, refreshExpiresAt });
  } catch (err) {
    console.error('auth/login error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /auth/refresh
// Accepts the long-lived refresh token (not the access token).
// Issues a new access token + a new refresh token (sliding 7-day window).
// ---------------------------------------------------------------------------
app.post('/auth/refresh', (req, res) => {
  const token = req.headers?.['x-stuffie-refresh'] ?? null;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  const payload = verifyRefreshJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired refresh token' });

  const { sub, userId, role } = payload;
  const tokenPayload    = { sub, userId, role };
  const now             = Math.floor(Date.now() / 1000);
  const accessToken     = signJWT(tokenPayload);
  const expiresAt       = now + 3600;
  const refreshToken    = signRefreshJWT(tokenPayload);
  const refreshExpiresAt = now + 7 * 24 * 3600;

  return res.json({ accessToken, expiresAt, refreshToken, refreshExpiresAt });
});

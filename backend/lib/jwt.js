// JWT helpers - HS256, no external dependencies.
//
// Access tokens:  1 hour,  signed with JWT_ACCESS_TOKEN_SECRET
// Refresh tokens: 7 days,  signed with JWT_REFRESH_TOKEN_SECRET
//   - carry a `type: 'refresh'` claim so they cannot be used as access tokens
//
// Secret env vars are read at call time (never cached at module load).

import { createHmac, timingSafeEqual } from 'crypto';

// Encode a plain object as base64url JSON
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

// ---------------------------------------------------------------------------
// Internal helper — sign any payload with a given secret + expiry (seconds)
// ---------------------------------------------------------------------------
const sign = (payload, secret, ttl) => {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const now    = Math.floor(Date.now() / 1000);
  const claims = b64url({ ...payload, iat: now, exp: now + ttl });
  const sig    = createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');
  return `${header}.${claims}.${sig}`;
};

// Internal helper — verify signature + expiry, return payload or null
const verify = (token, secret) => {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, claims, sig] = parts;
  const expected = createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');
  const sigBuf      = Buffer.from(sig,      'base64url');
  const expectedBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
};

// ---------------------------------------------------------------------------
// signJWT — 1-hour access token
// ---------------------------------------------------------------------------
export const signJWT = (payload) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_TOKEN_SECRET env var is not set');
  return sign({ ...payload, type: 'access' }, secret, 3600);
};

// ---------------------------------------------------------------------------
// signRefreshJWT — 7-day refresh token
// ---------------------------------------------------------------------------
export const signRefreshJWT = (payload) => {
  const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_TOKEN_SECRET env var is not set');
  return sign({ ...payload, type: 'refresh' }, secret, 7 * 24 * 3600);
};

// ---------------------------------------------------------------------------
// verifyRefreshJWT — validate a refresh token, return payload or null
// Only accepts tokens with type === 'refresh'
// ---------------------------------------------------------------------------
export const verifyRefreshJWT = (token) => {
  const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
  const payload = verify(token, secret);
  if (!payload || payload.type !== 'refresh') return null;
  return payload;
};

// ---------------------------------------------------------------------------
// verifyJWT — validate an access token, return payload or null
// Only accepts tokens with type === 'access'
// ---------------------------------------------------------------------------
export const verifyJWT = (token) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  const payload = verify(token, secret);
  if (!payload || payload.type !== 'access') return null;
  return payload;
};

// ---------------------------------------------------------------------------
// requireAuth middleware - validates X-Stuffie-Auth header, attaches req.user
// Returns 401 if token is missing, invalid, or expired.
// ---------------------------------------------------------------------------
export const requireAuth = (req, res, next) => {
  const token = req.headers?.['x-stuffie-auth'] ?? null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload; // { sub, userId, role, type, iat, exp }
  next();
};

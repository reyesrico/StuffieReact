// JWT helpers - HS256, 1-hour access tokens, no external dependencies.
// Secret is read from process.env.JWT_ACCESS_TOKEN_SECRET at call time.

import { createHmac, timingSafeEqual } from 'crypto';

// Encode a plain object as base64url JSON
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

// ---------------------------------------------------------------------------
// signJWT - create a signed HS256 JWT with a 1-hour expiry
// ---------------------------------------------------------------------------
export const signJWT = (payload) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_TOKEN_SECRET env var is not set');

  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const now    = Math.floor(Date.now() / 1000);
  const claims = b64url({ ...payload, iat: now, exp: now + 3600 });
  const sig    = createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');

  return `${header}.${claims}.${sig}`;
};

// ---------------------------------------------------------------------------
// verifyJWT - validate signature and expiry, return payload or null
// ---------------------------------------------------------------------------
export const verifyJWT = (token) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, claims, sig] = parts;

  // Recompute expected signature
  const expected = createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');

  // timingSafeEqual prevents timing oracle attacks on the HMAC comparison
  const sigBuf      = Buffer.from(sig,      'base64url');
  const expectedBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  // Decode claims and check expiry
  const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;

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

  req.user = payload; // { sub, userId, role, iat, exp }
  next();
};

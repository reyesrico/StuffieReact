/**
 * OAuth SSO routes
 *   POST /auth/google  — verify Google access_token, upsert user, issue our JWT
 *   POST /auth/apple   — verify Apple id_token (RS256/JWKS), upsert user, issue our JWT
 *
 * Industry standard:
 *   - OAuth users have NO password in our system (oauth_provider + oauth_id instead)
 *   - If email already exists with password → accounts are linked automatically
 *   - OAuth users are auto-approved (Google/Apple already verified identity)
 *   - Apple only sends name on FIRST authorization; subsequent logins omit it
 */
import { app, datastore } from 'codehooks-js';
import { createPublicKey, createVerify } from 'crypto';
import { signJWT, signRefreshJWT } from '../lib/jwt.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const strip = (user) => {
  // eslint-disable-next-line no-unused-vars
  const { password_hash: _pw, ...safe } = user;
  return safe;
};

const issueTokens = (user) => {
  const now     = Math.floor(Date.now() / 1000);
  const payload = { sub: user.email, userId: user.id, role: user.is_admin ? 'admin' : 'user' };
  return {
    accessToken:      signJWT(payload),
    expiresAt:        now + 3600,
    refreshToken:     signRefreshJWT(payload),
    refreshExpiresAt: now + 7 * 24 * 3600,
  };
};

/**
 * Find by oauth_id → or link existing email account → or create new user.
 * Returns a full user object; never throws for normal cases.
 */
const findOrCreateOAuthUser = async (db, { email, first_name, last_name, oauth_provider, oauth_id, oauth_avatar }) => {
  // 1. Exact match by oauth_id + provider (most reliable)
  const byId = [];
  await db.getMany('users', { oauth_id, oauth_provider }).forEach(u => byId.push(u));
  if (byId[0]) {
    // Silently refresh avatar URL on each login if it changed
    if (oauth_avatar && byId[0].oauth_avatar !== oauth_avatar) {
      db.updateOne('users', { _id: byId[0]._id }, { $set: { oauth_avatar } }).catch(() => {});
    }
    return byId[0];
  }

  // 2. Email match → link OAuth to existing email+password account
  if (email) {
    const byEmail = [];
    await db.getMany('users', { email }).forEach(u => byEmail.push(u));
    if (byEmail[0]) {
      const existing = byEmail[0];
      const updates = {
        oauth_provider,
        oauth_id,
        oauth_avatar: oauth_avatar || existing.oauth_avatar || null,
        // Backfill name if the existing account somehow has empty fields
        ...((!existing.first_name && first_name) ? { first_name } : {}),
        ...((!existing.last_name  && last_name)  ? { last_name  } : {}),
      };
      db.updateOne('users', { _id: existing._id }, { $set: updates }).catch(() => {});
      return { ...existing, ...updates };
    }
  }

  // 3. New user — get atomic next ID from counter
  const nextId = await getNextUserId(db);

  const newUser = {
    id:             nextId,
    email:          email || `${oauth_id}@privaterelay.appleid.com`,
    first_name:     first_name  || '',
    last_name:      last_name   || '',
    oauth_provider,
    oauth_id,
    oauth_avatar:   oauth_avatar || null,
    password_hash:  null,         // OAuth users have no password
    is_admin:       false,
    request:        false,        // Auto-approve — identity verified by OAuth provider
    created_at:     new Date().toISOString(),
  };

  const created = await db.insertOne('users', newUser);
  return { ...newUser, _id: created._id };
};

const getNextUserId = async (db) => {
  try {
    const raw    = await db.get('counter_users_id');
    const nextId = raw ? Number(raw) + 1 : 9; // seed after known 7 users
    await db.set('counter_users_id', String(nextId));
    return nextId;
  } catch {
    return Date.now() % 100000; // fallback (should never happen)
  }
};

// ---------------------------------------------------------------------------
// POST /auth/google
// Body: { access_token: string }
//
// We verify by calling Google's userinfo endpoint with the access_token.
// This is simpler than ID token verification and does not require JWKS.
// The response includes the user's profile info directly from Google.
// ---------------------------------------------------------------------------
app.post('/auth/google', async (req, res) => {
  const { access_token } = req.body ?? {};
  if (!access_token || typeof access_token !== 'string') {
    return res.status(400).json({ error: 'access_token required' });
  }

  try {
    const infoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(access_token)}`
    );
    if (!infoRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired Google token' });
    }

    const info = await infoRes.json();

    if (!info.email_verified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    const db   = await datastore.open();
    const user = await findOrCreateOAuthUser(db, {
      email:          info.email,
      first_name:     info.given_name  || '',
      last_name:      info.family_name || '',
      oauth_provider: 'google',
      oauth_id:       info.sub,
      oauth_avatar:   info.picture || null,
    });

    return res.json({ user: strip(user), ...issueTokens(user) });
  } catch (err) {
    console.error('auth/google error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /auth/apple
// Body: { id_token: string, first_name?: string, last_name?: string }
//
// Apple sends name + email ONLY on the FIRST authorization. Subsequent logins
// only have the id_token with the `sub` claim. We accept optional name fields
// from the frontend so we can store them on the initial sign-in.
//
// Verification: fetch Apple's JWKS (cached 1h), find key by kid,
// verify RS256 signature using Node.js crypto (no external deps).
// ---------------------------------------------------------------------------
let _appleKeysCache = null;
let _appleKeysCachedAt = 0;

const getApplePublicKeys = async () => {
  const now = Date.now();
  if (_appleKeysCache && now - _appleKeysCachedAt < 3_600_000) return _appleKeysCache;
  const r = await fetch('https://appleid.apple.com/auth/keys');
  if (!r.ok) throw new Error('Failed to fetch Apple public keys');
  const { keys } = await r.json();
  _appleKeysCache     = keys;
  _appleKeysCachedAt  = now;
  return keys;
};

const verifyAppleToken = async (id_token) => {
  const parts = id_token.split('.');
  if (parts.length !== 3) return null;

  let header, payload;
  try {
    header  = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    return null;
  }

  // Check expiry
  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;

  // Check issuer
  if (payload.iss !== 'https://appleid.apple.com') return null;

  // Find matching public key by kid
  const keys = await getApplePublicKeys();
  const jwk  = keys.find(k => k.kid === header.kid);
  if (!jwk) return null;

  // Verify RS256 signature using Node.js built-in crypto
  try {
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const verifier  = createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    const valid = verifier.verify(publicKey, parts[2], 'base64url');
    if (!valid) return null;
  } catch {
    return null;
  }

  return payload;
};

app.post('/auth/apple', async (req, res) => {
  const { id_token, first_name, last_name } = req.body ?? {};
  if (!id_token || typeof id_token !== 'string') {
    return res.status(400).json({ error: 'id_token required' });
  }

  try {
    const payload = await verifyAppleToken(id_token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired Apple token' });
    }

    // Validate audience against our Service ID if configured
    const clientId = process.env.APPLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      return res.status(401).json({ error: 'Token audience mismatch' });
    }

    if (!payload.sub) {
      return res.status(401).json({ error: 'Insufficient claims in Apple token' });
    }

    const db   = await datastore.open();
    const user = await findOrCreateOAuthUser(db, {
      email:          payload.email || null,
      first_name:     first_name || '',
      last_name:      last_name  || '',
      oauth_provider: 'apple',
      oauth_id:       payload.sub,
      oauth_avatar:   null, // Apple does not provide profile pictures
    });

    return res.json({ user: strip(user), ...issueTokens(user) });
  } catch (err) {
    console.error('auth/apple error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /auth/facebook
//
// Verifies a Facebook user access token via the Graph API, then finds or
// creates a local user account.
// ---------------------------------------------------------------------------
app.post('/auth/facebook', async (req, res) => {
  const { access_token } = req.body ?? {};
  if (!access_token || typeof access_token !== 'string') {
    return res.status(400).json({ error: 'access_token required' });
  }

  try {
    // Verify via Facebook Graph API and fetch profile
    const graphUrl = `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture.type(large)&access_token=${encodeURIComponent(access_token)}`;
    const graphRes = await fetch(graphUrl);

    if (!graphRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired Facebook token' });
    }

    const profile = await graphRes.json();

    // Graph API returns { error: {...} } with HTTP 200 for token errors
    if (profile.error || !profile.id) {
      console.error('auth/facebook graph error:', profile.error?.message);
      return res.status(401).json({ error: 'Could not verify Facebook identity' });
    }

    // Derive first/last name — fall back to splitting the full name
    const nameParts = (profile.name || '').trim().split(/\s+/);
    const first_name = profile.first_name || nameParts[0] || '';
    const last_name  = profile.last_name  || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

    // Profile picture URL — Graph API returns nested structure
    const oauth_avatar = profile.picture?.data?.url || null;

    const db   = await datastore.open();
    const user = await findOrCreateOAuthUser(db, {
      email:          profile.email || null,
      first_name,
      last_name,
      oauth_provider: 'facebook',
      oauth_id:       profile.id,
      oauth_avatar,
    });

    return res.json({ user: strip(user), ...issueTokens(user) });
  } catch (err) {
    console.error('auth/facebook error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

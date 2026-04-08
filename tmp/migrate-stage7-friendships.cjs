/**
 * Stage 7 Migration: friends + friendrequests → friendships
 *
 * New schema:
 *   user_id      (number) — the user who initiated or is in the friendship
 *   friend_id    (number) — the other user
 *   status       (string) — 'accepted' | 'pending'
 *   initiated_by (number) — who sent the original request
 *
 * Logic:
 *   friends      → status: 'accepted'
 *                  NOTE: friends is unidirectional (only one row per relationship).
 *                  We create TWO rows per friends record (A→B and B→A) so
 *                  both parties can query by their own user_id.
 *                  initiated_by is derived from friendrequests if a matching
 *                  request exists; otherwise set to friend_id (unknown, best guess).
 *
 *   friendrequests → status: 'pending' (one row only — request not yet accepted)
 *
 * Usage:
 *   node tmp/migrate-stage7-friendships.js --dry    # print only, no writes
 *   node tmp/migrate-stage7-friendships.js           # write to friendships collection
 */

const https = require('https');

const BASE_URL = process.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev';
const API_KEY  = process.env.VITE_CODEHOOKS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: Set VITE_CODEHOOKS_API_KEY env var');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry');

// ── Helpers ────────────────────────────────────────────────────────────────

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}/${path}`);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'x-apikey': API_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getAll(collection) {
  const results = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const batch = await request('GET', `${collection}?q={}&h={"$limit":${limit},"$offset":${offset}}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    results.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return results;
}

async function getUsers() {
  const rows = await request('GET', 'users?q={}&h={"$fields":{"id":1,"email":1}}');
  const map = {};
  for (const u of rows) map[u.email] = u.id;
  // Patch stale email alias in friends collection (email was updated in users but not in friends)
  map['erik.millan@microsoft.com'] = map['erik.millan@live.com'];
  return map;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Stage 7: friendships migration (${DRY_RUN ? 'DRY RUN' : 'LIVE'}) ===\n`);

  const [friends, friendRequests, emailToId] = await Promise.all([
    getAll('friends'),
    getAll('friendrequests'),
    getUsers(),
  ]);

  console.log(`  friends:        ${friends.length} records`);
  console.log(`  friendrequests: ${friendRequests.length} records`);
  console.log(`  users indexed:  ${Object.keys(emailToId).length}\n`);

  const friendships = [];

  // ── From accepted friends ────────────────────────────────────────────────
  // friends collection is already bidirectional (2 rows per pair: A→B and B→A).
  // Map each row 1:1 into friendships. Deduplicate with a Set.
  const seen = new Set();

  for (const row of friends) {
    const userId = emailToId[row.email_stuffier];
    const friendId = row.id_friend;

    if (!userId) {
      console.warn(`  WARN: no user found for email ${row.email_stuffier} — skipping`);
      continue;
    }

    const key = `${userId}:${friendId}`;
    if (seen.has(key)) {
      console.warn(`  WARN: duplicate friends record ${key} — skipping`);
      continue;
    }
    seen.add(key);

    // initiated_by: check friendrequests for who originally sent it
    const matchingReq = friendRequests.find(
      r => (emailToId[r.email_stuffier] === userId && r.id_friend === friendId) ||
           (emailToId[r.email_stuffier] === friendId && r.id_friend === userId)
    );
    const initiatedBy = matchingReq ? matchingReq.id_friend : userId;

    friendships.push({ user_id: userId, friend_id: friendId, status: 'accepted', initiated_by: initiatedBy });
  }

  // ── From pending requests ────────────────────────────────────────────────
  // Only add known users — skip stale requests where either party no longer exists
  const knownIds = new Set(Object.values(emailToId).filter(Boolean));
  for (const row of friendRequests) {
    const targetUserId = emailToId[row.email_stuffier];
    const requesterId  = row.id_friend;

    if (!targetUserId) {
      console.warn(`  WARN: no user found for email ${row.email_stuffier} in friendrequests — skipping`);
      continue;
    }
    if (!knownIds.has(requesterId)) {
      console.warn(`  WARN: requester id_friend=${requesterId} not in users — stale request, skipping`);
      continue;
    }

    // Only add as pending if NOT already captured as accepted above
    const alreadyAccepted = friendships.some(
      f => f.user_id === requesterId && f.friend_id === targetUserId && f.status === 'accepted'
    );
    if (!alreadyAccepted) {
      friendships.push({ user_id: targetUserId, friend_id: requesterId, status: 'pending', initiated_by: requesterId });
    }
  }

  // ── Print mapping ─────────────────────────────────────────────────────────
  console.log(`  → Will create ${friendships.length} friendships records:\n`);
  for (const f of friendships) {
    console.log(`  user_id=${f.user_id} friend_id=${f.friend_id} status=${f.status} initiated_by=${f.initiated_by}`);
  }

  if (DRY_RUN) {
    console.log('\n  DRY RUN — nothing written. Run without --dry to apply.\n');
    return;
  }

  // ── Write to friendships ─────────────────────────────────────────────────
  console.log('\n  Writing...');
  let ok = 0, fail = 0;
  for (const record of friendships) {
    try {
      await request('POST', 'friendships', record);
      ok++;
    } catch (e) {
      console.error(`  FAIL: ${JSON.stringify(record)}`, e.message);
      fail++;
    }
  }

  console.log(`\n  Done: ${ok} written, ${fail} failed`);

  // ── Verify ───────────────────────────────────────────────────────────────
  const written = await getAll('friendships');
  console.log(`  Verify: ${written.length} records in friendships collection`);

  if (written.length !== friendships.length) {
    console.error(`  ⚠️  COUNT MISMATCH — expected ${friendships.length}, got ${written.length}`);
  } else {
    console.log('  ✅ Count matches\n');
  }
}

main().catch(err => { console.error(err); process.exit(1); });

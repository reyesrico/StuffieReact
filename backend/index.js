/**
 * Stuffie — Codehooks serverless functions
 * Deploy: cd backend && codehooks deploy
 * Set key: codehooks set-env --projectname stuffie-2u0v --space dev --key OPENAI_API_KEY --value sk-... --encrypted
 *
 * OPENAI_API_KEY lives only in Codehooks env vars — never in source code or git.
 */
import { app, datastore } from 'codehooks-js';

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

// Re-enable Codehooks auto-REST API for all collections.
// Without this line, deploying a codehooks-js function disables the built-in
// CRUD endpoints (/stuffiers, /stuff, /friends, etc.) — breaking the whole app.
app.crudlify();

// =============================================================================
// Atomic ID counters — replaces unsafe client-side Math.max pattern
// POST /stuff/next-id   → { id: <next integer> }
// POST /stuffiers/next-id → { id: <next integer> }
//
// Uses Codehooks keyvalue store as an atomic counter so concurrent requests
// never generate duplicate numeric IDs.
// =============================================================================

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
//   1. Fetches stuffiersstuff rows for this user
//   2. Batch-fetches matching stuff rows
//   3. Merges cost onto each product
//   Returns: Array<Product & { cost: number, ss_id: string }>
// =============================================================================

app.get('/userproducts/:stuffierId', async (req, res) => {
  const stuffierId = Number(req.params.stuffierId);
  if (!stuffierId || isNaN(stuffierId)) {
    return res.status(400).json({ error: 'Invalid stuffierId' });
  }

  const db = await datastore.open();

  // 1. Get ownership rows
  const ssRows = [];
  const ssCursor = db.getMany('user_items', { filter: { user_id: stuffierId } });
  for await (const row of ssCursor) ssRows.push(row);

  if (ssRows.length === 0) return res.json([]);

  // 2. Get matching stuff rows
  const stuffIds = ssRows.map(r => r.item_id).filter(Boolean);
  const stuffMap = {};
  const stuffCursor = db.getMany('items', { filter: { id: { $in: stuffIds } } });
  for await (const row of stuffCursor) stuffMap[row.id] = row;

  // 3. Merge
  const result = ssRows
    .map(ss => {
      const product = stuffMap[ss.item_id];
      if (!product) return null;
      return { ...product, cost: ss.asking_price ?? null, ss_id: ss._id };
    })
    .filter(Boolean);

  return res.json(result);
});

export default app.init();

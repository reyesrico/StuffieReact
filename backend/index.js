/**
 * Stuffie — Codehooks serverless functions
 * Deploy: cd backend && codehooks deploy
 * Set key: codehooks set-env --projectname stuffie-2u0v --space dev --key OPENAI_API_KEY --value sk-... --encrypted
 *
 * OPENAI_API_KEY lives only in Codehooks env vars — never in source code or git.
 */
import { app } from 'codehooks-js';

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

export default app.init();

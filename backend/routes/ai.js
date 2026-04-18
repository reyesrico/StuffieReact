/**
 * AI chat routes — all OpenAI calls proxied here so the API key never
 * touches the browser.
 *
 *   POST /ai-chat         — full response (JSON)
 *   POST /ai-chat-stream  — streaming response (SSE / text/event-stream)
 */
import { app } from 'codehooks-js';

const ALLOWED_MODELS = ['gpt-5-nano', 'gpt-4.1-nano'];
const DEFAULT_MODEL  = 'gpt-5-nano';

const safeModel = (model) => ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

const buildMessages = (systemPrompt, messages) => [
  ...(systemPrompt ? [{ role: 'system', content: String(systemPrompt) }] : []),
  ...messages,
];

const openaiHeaders = () => ({
  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
});

// ---------------------------------------------------------------------------
// POST /ai-chat-stream — SSE stream forwarded verbatim from OpenAI
// ---------------------------------------------------------------------------
app.post('/ai-chat-stream', async (req, res) => {
  const { model, messages, systemPrompt } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({
      model: safeModel(model),
      stream: true,
      stream_options: { include_usage: true },
      messages: buildMessages(systemPrompt, messages),
    }),
  });

  if (!openaiRes.ok) {
    return res.status(openaiRes.status).json({ error: `AI request failed (${openaiRes.status})` });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const reader  = openaiRes.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch {
    res.write('data: {"error":"stream interrupted"}\n\n');
  } finally {
    res.end();
  }
});

// ---------------------------------------------------------------------------
// POST /ai-chat — full JSON response (kept as fallback)
// ---------------------------------------------------------------------------
app.post('/ai-chat', async (req, res) => {
  const { model, messages, systemPrompt } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({
      model: safeModel(model),
      messages: buildMessages(systemPrompt, messages),
    }),
  });

  if (!openaiRes.ok) {
    return res.status(openaiRes.status).json({ error: `AI request failed (${openaiRes.status})` });
  }

  const data = await openaiRes.json();
  return res.json({
    content:      data.choices?.[0]?.message?.content ?? '',
    total_tokens: data.usage?.total_tokens ?? 0,
  });
});

// ---------------------------------------------------------------------------
// POST /ai-vision — GPT-4.1 vision: identify product from image
// ---------------------------------------------------------------------------
app.post('/ai-vision', async (req, res) => {
  const { imageBase64 } = req.body ?? {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({
      model: 'gpt-4.1',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'low',
              },
            },
            {
              type: 'text',
              text: 'Identify the main consumer product shown in this image. Reply ONLY with valid JSON: {"name":"<brand and model>","description":"<one sentence>"}. If no clear product is visible, return {"name":"","description":""}.',
            },
          ],
        },
      ],
    }),
  });

  if (!openaiRes.ok) {
    return res.status(openaiRes.status).json({ error: `Vision request failed (${openaiRes.status})` });
  }

  const data = await openaiRes.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return res.json({ name: '', description: '', total_tokens: data.usage?.total_tokens ?? 0 });
  }
  try {
    const parsed = JSON.parse(match[0]);
    return res.json({
      name:         parsed.name ?? '',
      description:  parsed.description ?? '',
      total_tokens: data.usage?.total_tokens ?? 0,
    });
  } catch {
    return res.json({ name: '', description: '', total_tokens: 0 });
  }
});

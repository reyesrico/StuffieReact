// Stuffie — Codehooks serverless entry point
//
// Deploy : cd backend && npx coho deploy
// Env    : JWT_ACCESS_TOKEN_SECRET, OPENAI_API_KEY
//
// Route modules register handlers on the shared `app` instance.
// Registration ORDER matters — explicit routes must come before crudlify().
//
//   lib/jwt.js             signJWT, verifyJWT, requireAuth
//   lib/password.js        verifyPassword, hashPasswordV2
//
//   routes/auth.js         POST /auth/login, /auth/refresh
//   routes/ai.js           POST /ai-chat, /ai-chat-stream
//   routes/products.js     GET  /userproducts/:id, POST next-id counters
//   routes/transactions.js loan, purchase, exchange accept + complete flows
//   routes/admin.js        orphan detection, subcategory proposals (admin only)
//   routes/push.js         POST /push-subscribe, DELETE /push-subscribe
//   routes/users.js        SEC-API middleware, GET /users, PATCH /users/:id
//                          Must be last before crudlify (registers middleware)
import { app } from 'codehooks-js';

import './routes/auth.js';
import './routes/oauth.js'; // Google + Apple SSO — before crudlify
import './routes/ai.js';
import './routes/products.js';
import './routes/transactions.js'; // also handles POST /exchange_requests, /loan_requests, /purchase_requests, /friendships with push
import './routes/push.js';
import './routes/admin.js';
import './routes/users.js'; // SEC-API middleware registered here — must come after explicit routes

// Auto-REST for all remaining collections.
// Must be last — crudlify registers a wildcard /:collection/:id handler
// that would shadow any custom routes registered after it.
app.crudlify();

export default app.init();

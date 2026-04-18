/**
 * push.js — Web Push helper
 *
 * Wraps the `web-push` library. Initialised once at import time using the
 * VAPID keys stored as Codehooks environment variables:
 *
 *   VAPID_PUBLIC_KEY   — base64url-encoded P-256 public key
 *   VAPID_PRIVATE_KEY  — base64url-encoded P-256 private key
 *   VAPID_SUBJECT      — mailto: or https: contact URI (required by spec)
 *
 * Usage:
 *   import { sendPushToUser } from '../lib/push.js';
 *   await sendPushToUser(db, userId, { title, body, url });
 */
import webpush from 'web-push';

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || '';

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

/**
 * Send a Web Push notification to a user by their numeric userId.
 *
 * Looks up the stored subscription in the `push_subscriptions` collection.
 * Silently no-ops if:
 *   - VAPID keys are not configured
 *   - No subscription found for the user
 *   - The send call throws (bad subscription, etc.)
 *
 * Expired/invalid subscriptions (HTTP 410) are automatically removed.
 *
 * @param {object}  db     — Codehooks datastore instance (already opened)
 * @param {number}  userId — Recipient's numeric user id
 * @param {object}  payload
 * @param {string}  payload.title
 * @param {string}  payload.body
 * @param {string}  [payload.url='/notifications'] — in-app path to open on click
 */
export const sendPushToUser = async (db, userId, { title, body, url = '/notifications' }) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_SUBJECT) return;

  try {
    const subs = [];
    await db.getMany('push_subscriptions', { user_id: userId }).forEach(s => subs.push(s));
    if (subs.length === 0) return;

    const payloadStr = JSON.stringify({ title, body, url });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub.subscription, payloadStr);
      } catch (err) {
        // HTTP 410 = subscription expired or user revoked permission — clean it up
        if (err.statusCode === 410) {
          await db.deleteOne('push_subscriptions', { _id: sub._id }).catch(() => {});
        }
        // Any other error: log but don't propagate — push is best-effort
        console.warn(`sendPushToUser(${userId}) send failed:`, err.statusCode ?? err.message);
      }
    }
  } catch (err) {
    console.warn(`sendPushToUser(${userId}) lookup failed:`, err.message);
  }
};

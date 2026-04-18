import type { ChatMessage } from './chatTypes';

const HISTORY_MAX_MESSAGES = 40; // last 40 messages (~20 exchanges)

export const getHistoryKey = (userId: string | number) =>
  `stuffie_chat_history_${userId}`;

export const getUsageKey = (userId: string | number, modelId: string): string => {
  const today = new Date().toISOString().split('T')[0];
  return `stuffie_chat_tokens_${userId}_${modelId}_${today}`;
};

export const loadHistory = (userId: string | number): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(getHistoryKey(userId));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (userId: string | number, messages: ChatMessage[]): void => {
  const capped =
    messages.length > HISTORY_MAX_MESSAGES
      ? messages.slice(-HISTORY_MAX_MESSAGES)
      : messages;
  try {
    localStorage.setItem(getHistoryKey(userId), JSON.stringify(capped));
  } catch {
    // Quota exceeded — skip silently
  }
};

export const loadTokensUsed = (userId: string | number, modelId: string): number =>
  parseInt(localStorage.getItem(getUsageKey(userId, modelId)) || '0', 10);

export const saveTokensUsed = (
  userId: string | number,
  modelId: string,
  total: number,
): void => localStorage.setItem(getUsageKey(userId, modelId), String(total));

/** Remove token-budget keys from previous days to prevent unbounded growth. */
export const pruneOldUsageKeys = (userId: string | number): void => {
  const today = new Date().toISOString().split('T')[0];
  const prefix = `stuffie_chat_tokens_${userId}_`;
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix) && !k.endsWith(`_${today}`))
    .forEach(k => localStorage.removeItem(k));
};

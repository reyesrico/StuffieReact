import React from "react";
import { getUsers } from "../api/users.api";

// All OpenAI calls go through the Codehooks proxy — the API key NEVER touches the browser.
const PROXY_URL = `${import.meta.env.VITE_CODEHOOKS_SERVER_URL}ai-chat`;
const PROXY_KEY = import.meta.env.VITE_CODEHOOKS_API_KEY || '';

// ---------------------------------------------------------------------------
// Available models — cheapest OpenAI options (as of March 2026)
// Pricing: https://developers.openai.com/api/docs/pricing
// dailyTokensTotal = app-wide daily token budget shared across all users.
// ---------------------------------------------------------------------------
export interface ChatModel {
  id: string;
  label: string;
  priceInputPer1MTokens: number;   // USD
  priceOutputPer1MTokens: number;  // USD
  /** App-wide token budget per day (shared across all users). */
  dailyTokensTotal: number;
  provider: 'openai';
}

export const CHAT_MODELS: Record<string, ChatModel> = {
  'gpt-5-nano': {
    id: 'gpt-5-nano',
    label: 'GPT-5 nano — $0.05/$0.20 per 1M tokens',
    priceInputPer1MTokens: 0.05,
    priceOutputPer1MTokens: 0.20,
    // 60k tokens/day → ~$0.012/day max across all users
    dailyTokensTotal: 60_000,
    provider: 'openai',
  },
  'gpt-4.1-nano': {
    id: 'gpt-4.1-nano',
    label: 'GPT-4.1 nano — $0.10/$0.40 per 1M tokens',
    priceInputPer1MTokens: 0.10,
    priceOutputPer1MTokens: 0.40,
    // 50k tokens/day → ~$0.02/day max across all users
    dailyTokensTotal: 50_000,
    provider: 'openai',
  },
};

export const DEFAULT_MODEL_ID = 'gpt-5-nano';

// Module-level in-flight lock — persists across React StrictMode double-mounts.
// Key: `${userId}_${modelId}` so each user+model pair has its own lock.
const inFlightLocks = new Set<string>();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatGptOptions {
  userId?: number | string;
  userName?: string;
  productsContext?: string;
  modelId?: string;
}

const buildSystemPrompt = (userName: string, productsContext: string) => `
You are Stuffie Assistant, a concise AI support agent for Stuffie — a personal collection tracking and social sharing app.

## Current User
${userName}

## App Pages
- /  → Feed
- /products  → My Stuff (products grouped by category)
- /friends  → Friends
- /notifications  → Pending requests
- /stuffier  → Profile (name, photo, password)
- /product/add  → Add product
- Apps menu: Map, Tickets, Support, Charts, Spotify, Cards

## ${userName}'s Products
${productsContext || 'None yet.'}

## RESPONSE FORMAT RULES (strictly follow these)
- Product list requests → bullet list only, one product per line: \`- Product Name\`
- Navigation/how-to → path only: \`Feed > Products\` or \`> /product/add\`
- Yes/no or short answer → one sentence, plain text
- NEVER use headers, bold, or extra explanation
- NEVER add intro sentences like "Here are your products:" — jump straight to the answer
- If asked something off-topic: one sentence decline only
- Only use product data provided above — never invent products
`.trim();

const getUsageKey = (userId: string | number, modelId: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `stuffie_chat_tokens_${userId}_${modelId}_${today}`;
};

/** Remove localStorage keys from previous days to avoid unbounded growth */
const pruneOldUsageKeys = (userId: string | number) => {
  const today = new Date().toISOString().split('T')[0];
  const prefix = `stuffie_chat_tokens_${userId}_`;
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix) && !k.endsWith(`_${today}`))
    .forEach(k => localStorage.removeItem(k));
};

export const useChatGpt = ({
  userId,
  userName = 'User',
  productsContext = '',
  modelId = DEFAULT_MODEL_ID,
}: UseChatGptOptions = {}) => {
  const model = CHAT_MODELS[modelId] ?? CHAT_MODELS[DEFAULT_MODEL_ID];

  const lockKey = `${userId}_${modelId}`;

  const [conversation, setConversation] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalUsers, setTotalUsers] = React.useState<number>(1);
  const [tokensUsedToday, setTokensUsedToday] = React.useState<number>(() => {
    if (!userId) return 0;
    return parseInt(localStorage.getItem(getUsageKey(userId, modelId)) || '0', 10);
  });

  // Fetch real user count from DB on mount; also prune stale usage keys
  React.useEffect(() => {
    if (userId) pruneOldUsageKeys(userId);
    getUsers()
      .then(users => setTotalUsers(Math.max(users.length, 1)))
      .catch(() => setTotalUsers(1));
  }, []);

  // Sync usage from localStorage and reset conversation when model changes
  React.useEffect(() => {
    if (!userId) return;
    const stored = parseInt(localStorage.getItem(getUsageKey(userId, modelId)) || '0', 10);
    setTokensUsedToday(stored);
    setConversation([]);
  }, [userId, modelId]);

  const dailyLimit = Math.floor(model.dailyTokensTotal / totalUsers);
  const tokensRemaining = Math.max(0, dailyLimit - tokensUsedToday);
  const isLimitReached = tokensRemaining <= 0;

  // Track exact tokens from API response (always read fresh to avoid stale closure)
  const trackUsage = React.useCallback((tokens: number) => {
    if (!userId) return;
    const key = getUsageKey(userId, modelId);
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const newTotal = current + tokens;
    localStorage.setItem(key, String(newTotal));
    setTokensUsedToday(newTotal);
  }, [userId, modelId]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightLocks.has(lockKey) || isLimitReached) return;

    inFlightLocks.add(lockKey);
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const updatedConversation = [...conversation, userMsg];
    setConversation(updatedConversation);
    setIsLoading(true);

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-apikey': PROXY_KEY,
        },
        body: JSON.stringify({
          model: model.id,
          messages: updatedConversation,
          systemPrompt: buildSystemPrompt(userName, productsContext),
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = (data.content as string) || '';
      // Use exact token count returned by proxy for accurate budget tracking
      const tokensUsed = (data.total_tokens as number) ?? 0;
      setConversation(prev => [...prev, { role: 'assistant', content: assistantContent }]);
      trackUsage(tokensUsed);
    } catch (err) {
      console.error('Chat error:', err);
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      inFlightLocks.delete(lockKey);
      setIsLoading(false);
    }
  };

  const clearConversation = () => setConversation([]);

  return {
    conversation,
    sendMessage,
    isLoading,
    tokensUsedToday,
    tokensRemaining,
    isLimitReached,
    clearConversation,
    dailyLimit,
    totalUsers,
    model,
  };
};

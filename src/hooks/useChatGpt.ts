import React from "react";
import { getUsers } from "../api/users.api";
import { buildSystemPrompt } from "./chat/chatPrompt";
import {
  loadHistory,
  saveHistory,
  loadTokensUsed,
  saveTokensUsed,
  pruneOldUsageKeys,
  getHistoryKey,
} from "./chat/chatStorage";
import { detectStuck } from "./chat/chatStuck";

export type { ChatMessage } from "./chat/chatTypes";
export type { UseChatGptOptions } from "./chat/chatTypes";
import type { ChatMessage, UseChatGptOptions } from "./chat/chatTypes";

// All OpenAI calls go through the Codehooks proxy — the API key NEVER touches the browser.
const PROXY_STREAM_URL = `${import.meta.env.VITE_CODEHOOKS_SERVER_URL}ai-chat-stream`;
const PROXY_KEY = import.meta.env.VITE_CODEHOOKS_API_KEY || '';

// ---------------------------------------------------------------------------
// Available models — cheapest OpenAI options (as of March 2026)
// ---------------------------------------------------------------------------
export interface ChatModel {
  id: string;
  label: string;
  priceInputPer1MTokens: number;
  priceOutputPer1MTokens: number;
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
    dailyTokensTotal: 60_000,
    provider: 'openai',
  },
  'gpt-4.1-nano': {
    id: 'gpt-4.1-nano',
    label: 'GPT-4.1 nano — $0.10/$0.40 per 1M tokens',
    priceInputPer1MTokens: 0.10,
    priceOutputPer1MTokens: 0.40,
    dailyTokensTotal: 50_000,
    provider: 'openai',
  },
};

export const DEFAULT_MODEL_ID = 'gpt-5-nano';

// Module-level in-flight lock — persists across React StrictMode double-mounts.
const inFlightLocks = new Set<string>();

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useChatGpt = ({
  userId,
  userName = 'User',
  userEmail = '',
  productsContext = '',
  friendsContext = '',
  modelId = DEFAULT_MODEL_ID,
}: UseChatGptOptions = {}) => {
  const model = CHAT_MODELS[modelId] ?? CHAT_MODELS[DEFAULT_MODEL_ID];
  const lockKey = `${userId}_${modelId}`;

  // Support email: prefer env var, fallback to first admin user fetched below.
  const [adminEmail, setAdminEmail] = React.useState(
    import.meta.env.VITE_SUPPORT_EMAIL || '',
  );

  // Lazy initialisers run synchronously on first render — no flash, no double-read.
  const [conversation, setConversation] = React.useState<ChatMessage[]>(() =>
    userId ? loadHistory(userId) : [],
  );
  const [tokensUsedToday, setTokensUsedToday] = React.useState<number>(() =>
    userId ? loadTokensUsed(userId, modelId) : 0,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStuck, setIsStuck] = React.useState(false);
  const [totalUsers, setTotalUsers] = React.useState<number>(1);

  // Skip the first run of the [userId, modelId] effect — initialisers already
  // covered mount. Only re-sync when the values actually change (login / model switch).
  const isFirstRender = React.useRef(true);

  // On mount: fetch user count + resolve admin email
  React.useEffect(() => {
    if (userId) pruneOldUsageKeys(userId);
    getUsers()
      .then(users => {
        setTotalUsers(Math.max(users.length, 1));
        // Only derive from DB when env var is absent
        if (!import.meta.env.VITE_SUPPORT_EMAIL) {
          const admin = users.find(
            u => (u as any).admin === true || u.is_admin === true,
          );
          if (admin?.email) setAdminEmail(admin.email);
        }
      })
      .catch(() => setTotalUsers(1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync storage when userId or modelId changes (not on initial mount)
  React.useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!userId) return;
    setTokensUsedToday(loadTokensUsed(userId, modelId));
    setConversation(loadHistory(userId));
  }, [userId, modelId]);

  const dailyLimit = Math.floor(model.dailyTokensTotal / totalUsers);
  const tokensRemaining = Math.max(0, dailyLimit - tokensUsedToday);
  const isLimitReached = tokensRemaining <= 0;

  const trackUsage = React.useCallback(
    (tokens: number) => {
      if (!userId) return;
      const newTotal = loadTokensUsed(userId, modelId) + tokens;
      saveTokensUsed(userId, modelId, newTotal);
      setTokensUsedToday(newTotal);
    },
    [userId, modelId],
  );

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightLocks.has(lockKey) || isLimitReached) return;

    inFlightLocks.add(lockKey);
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const updatedConversation = [...conversation, userMsg];

    setIsStuck(detectStuck(updatedConversation));
    // Push empty assistant placeholder immediately — streaming fills it in-place
    setConversation([...updatedConversation, { role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      const response = await fetch(PROXY_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-apikey': PROXY_KEY },
        body: JSON.stringify({
          model: model.id,
          messages: updatedConversation,
          systemPrompt: buildSystemPrompt(userName, productsContext, friendsContext),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let totalTokens = 0;
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const chunk = JSON.parse(payload);
            if (chunk.usage?.total_tokens) totalTokens = chunk.usage.total_tokens;
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setConversation(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: last.content + delta };
                }
                return updated;
              });
            }
          } catch { /* malformed chunk — skip */ }
        }
      }

      if (totalTokens > 0) trackUsage(totalTokens);

      // Persist on success only (errors are not saved to history)
      if (userId) {
        saveHistory(userId, [
          ...updatedConversation,
          { role: 'assistant', content: assistantContent },
        ]);
      }
    } catch (err) {
      console.error('Chat stream error:', err);
      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
          };
        }
        return updated;
      });
    } finally {
      inFlightLocks.delete(lockKey);
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setIsStuck(false);
    if (userId) localStorage.removeItem(getHistoryKey(userId));
  };

  const supportEmailUrl = React.useMemo(() => {
    if (!adminEmail) return '';
    const lastQ = conversation.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    const log = conversation.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
    const subject = encodeURIComponent(`Stuffie Support – Help needed by ${userName}`);
    const body = encodeURIComponent(
      `User: ${userName}\nEmail: ${userEmail || 'unknown'}\n\nQuestion:\n${lastQ}\n\nRecent conversation:\n${log}`,
    );
    return `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  }, [conversation, userName, userEmail, adminEmail]);

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
    isStuck,
    supportEmailUrl,
  };
};


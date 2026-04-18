import type { ChatMessage } from './chatTypes';

const STOP_WORDS = new Set([
  'how', 'do', 'i', 'can', 'the', 'a', 'to', 'my', 'me', 'what', 'where', 'is',
  'it', 'in', 'on', 'for', 'of', 'and', 'or', 'why', 'when', 'who', 'help',
  'please', 'this', 'that', 'are', 'was', 'be', 'have', 'has', 'an', 'at', 'by',
  'not', 'with', 'from', 'up', 'about', 'get', 'see', 'use', 'im', 'dont',
  'cant', 'still', 'just', 'want', 'need', 'tell', 'show', 'find', 'know',
]);

const extractKeywords = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 2 && !STOP_WORDS.has(w)),
  );

/**
 * Returns true when the last 3 user messages share keywords across 2+ pairs —
 * a strong signal that the user is asking the same question repeatedly.
 */
export const detectStuck = (messages: ChatMessage[]): boolean => {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length < 3) return false;
  const last3 = userMessages.slice(-3).map(m => extractKeywords(m.content));
  const pairs: [Set<string>, Set<string>][] = [
    [last3[0], last3[1]],
    [last3[1], last3[2]],
    [last3[0], last3[2]],
  ];
  return pairs.filter(([a, b]) => [...a].some(w => b.has(w))).length >= 2;
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UseChatGptOptions {
  userId?: number | string;
  userName?: string;
  userEmail?: string;
  /** Rendered summary of the current user's products (built by FloatingChat). */
  productsContext?: string;
  /** Rendered summary of each friend's products (built by FloatingChat). */
  friendsContext?: string;
  modelId?: string;
}

import Product from '../types/Product';

export default interface FeedPost {
  friend_id?: number,
  friend_firstName: string,
  friend_lastName: string,
  product: Product,
  date: string,
  /** Feed rank score (0–100) — populated by rankFeed algorithm */
  score?: number,
}

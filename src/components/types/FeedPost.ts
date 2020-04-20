import Product from '../types/Product';

export default interface FeedPost {
  friend_firstName: string,
  friend_lastName: string,
  product: Product,
  date: string
}

import Product from '../types/Product';
import User from '../types/User';

export default interface FriendProducts {
  friend: User,
  products: Product[];
}

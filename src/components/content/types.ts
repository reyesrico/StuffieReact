import FriendProducts from '../types/FriendProducts';
import ProductsMap from '../types/ProductsMap';
import User from '../types/User';

export interface AddCategoryProps {
  addCategory: Function;
  addSubCategory: Function;
  fetchCategories: Function;
  fetchSubCategories: Function;
  type: string;
}

export interface ContentProps {
  user: User
}

export interface ContentState {
  friends: number[],
  friendsProducts: FriendProducts[],
}

export interface FriendsProps {
  t: Function,
  friends: any,
  user: User
}

export interface CategoryPageProps {
  products: ProductsMap,
  match: any,
  location: any
}

export interface FeedRowProps {
  product: number,
  user: User,
  fetchProduct: Function
}

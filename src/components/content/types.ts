import FriendProducts from '../types/FriendProducts';
import FriendRequest from '../types/FriendRequest';
import ProductsMap from '../types/ProductsMap';
import User from '../types/User';
import Subcategory from '../types/Subcategory';

export interface AddCategoryProps {
  addCategory: Function;
  addSubCategory: Function;
  fetchCategories: Function;
  fetchSubCategories: Function;
  type: string;
}

export interface ContentProps {
  user: User,
  subcategories: Subcategory[]
}

export interface ContentState {
  isLoading: boolean,
  friends: number[],
  friendsProducts: FriendProducts[],
}

export interface FriendsProps {
  t: Function,
  friends: any,
  friendsRequests: FriendRequest[],
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
  fetchProduct: Function,
  subcategories: Subcategory[]
}

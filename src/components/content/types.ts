import Category from '../types/Category';
import FeedPost from '../types/FeedPost';
import FriendRequest from '../types/FriendRequest';
import ProductsMap from '../types/ProductsMap';
import Subcategory from '../types/Subcategory';
import User from '../types/User';

export interface AddCategoryProps {
  addCategory: Function;
  addSubCategory: Function;
  categories: Category[],
  subcategories: Subcategory[],
  type: string;
}

export interface ContentProps {
  user: User,
  friends: User[],
  subcategories: Subcategory[],
  fetchFriendsProducts: Function
}

export interface ContentState {
  isLoading: boolean,
  feed: FeedPost[],
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
  feedPost: FeedPost,
  subcategories: Subcategory[]
}
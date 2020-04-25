// Components for State
import User from '../components/types/User';
import Category from '../components/types/Category';
import ExchangeRequest from '../components/types/ExchangeRequest';
import FriendRequest from '../components/types/FriendRequest';
import ProductsMap from '../components/types/ProductsMap';
import SubCategory from '../components/types/Subcategory';

export default interface State {
  user: User,
  userRequests: User[],
  categories: Category[],
  subcategories: SubCategory[],
  friends: User[],
  products: ProductsMap,
  friendsRequests: FriendRequest[],
  exchangeRequests: ExchangeRequest[]
}

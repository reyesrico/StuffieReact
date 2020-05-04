// Components for State
import User from '../components/types/User';
import Category from '../components/types/Category';
import ExchangeRequest from '../components/types/ExchangeRequest';
import FeedPost from '../components/types/FeedPost';
import FriendRequest from '../components/types/FriendRequest';
import LoanRequest from '../components/types/LoanRequest';
import Product from '../components/types/Product';
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
  exchangeRequests: ExchangeRequest[],
  loanRequests: LoanRequest[],
  pendingProducts: Product[],
  feed: FeedPost[]
}

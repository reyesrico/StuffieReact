import Category from "../types/Category";
import FriendRequest from "../types/FriendRequest";
import ProductsMap from "../types/ProductsMap";
import Subcategory from "../types/Subcategory";
import User from "../types/User";

export interface MainRoutesProps {
}

export interface FetchDataProps {
  user: User,
  fetchCategories: Function,
  fetchFriends: Function,
  fetchFriendsRequests: Function,
  fetchProducts: Function,
  fetchSubCategories: Function,
  fetchExchangeRequests: Function,
  fetchLoanRequests: Function,
  fetchPendingProducts: Function,
  fetchUserRequests: Function,
  fetchSpotify: Function,
  t: Function
}

export interface MainProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
  stuff: any,
  friends: any,
  friendsRequests: FriendRequest[],
  t: Function
}

export interface AuthState {
  error: string,
  user: User
}

export interface LoginProps {
  setMessage: Function
}

export interface LoginState {
  email: string,
  password: string,
  loginFB: boolean
}

export interface RegisterProps {
  setMessage: Function
}

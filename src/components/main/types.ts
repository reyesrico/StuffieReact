import Category from "../types/Category";
import FriendRequest from "../types/FriendRequest";
import ProductsMap from "../types/ProductsMap";
import Subcategory from "../types/Subcategory";
import User from "../types/User";

export interface MainRoutesProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
  stuff: any,
  friends: any,
  friendsRequests: FriendRequest[],
}

export interface FetchDataProps {
  user: User,
  fetchCategories: Function,
  fetchFriends: Function,
  fetchProducts: Function,
  fetchProductsId: Function, 
  fetchSubCategories: Function,
  setUser: Function,
  userRequests: User[],
  categories: Category[],
  subcategories: Subcategory[],
  friends: User[],
}

export interface MainProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
  stuff: any,
  friends: any,
  friendsRequests: FriendRequest[],
  setUser: Function,
  t: Function
}

export interface AuthState {
  error: string,
  user: User
}

export interface LoginProps {
  fetchUser: Function,
  history: any,
  loginUser: Function,
  setUser: Function
}

export interface LoginState {
  email: string,
  password: string,
  loginFB: boolean
}

export interface RegisterProps {
  setUser: Function
}

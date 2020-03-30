import Category from "../types/Category";
import ProductsMap from "../types/ProductsMap";
import Subcategory from '../types/Subcategory';
import User from "../types/User";

export interface MainRoutesProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
  stuff: any,
  friends: any
}

export interface FetchDataProps {
  user: User,
  fetchCategories: Function,
  fetchFriends: Function,
  fetchProducts: Function,
  fetchProductsId: Function, 
  fetchSubCategories: Function  
}

export interface MainProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
  stuff: any,
  friends: any,
  t: Function
}

export interface AuthState {
  error: string,
  user: User
}

export interface LoginProps {
  history: any
}

export interface LoginState {
  email: string,
  password: string,
  loginFB: boolean
}

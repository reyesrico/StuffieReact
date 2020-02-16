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

export interface MainProps {
  user: User,
  fetchCategories: Function,
  fetchFriends: Function,
  fetchProducts: Function,
  fetchProductsId: Function, 
  fetchSubCategories: Function
}

export interface AuthState {
  error: string,
  user: User
}

export interface LoginProps {
  history: any
}

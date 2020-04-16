import Category from "../types/Category";
import FriendRequest from "../types/FriendRequest";
import ProductsMap from "../types/ProductsMap";
import Stuff from "../types/Stuff";
import Subcategory from '../types/Subcategory';
import User from "../types/User";

export interface AddProductProps {
  addProduct: any,
  categories: Category[],
  subcategories: Subcategory[],
  user: User,
}

export interface ProductState {
  product: Stuff | null,
  categoryName: string | null,
  subcategoryName: string | null
}

export interface ProductProps {
  fetchProduct: any,
  fetchCategory: any,
  fetchSubCategory: any,
  match: any
}

export interface ProductsProps {
  categories: Category[],
  products: ProductsMap,
  user: User,
}

export interface TableDataProps {
  data: any,
}

export interface TableTitleProps {
  title: string,
}

export interface SearchMatchProps {
  title: string,
  match: string,
}

export interface TableProps {
  titles: string[],
  searchTerm: string,
  data: any,
}

export interface SearchProps {
  userInput(event: any): void,
  searchTerm: string,
}

export interface SearchBarProps {
  categories: Category[],
}

export interface MenuProps {
  categories: Category[],
  products: ProductsMap,
  t: Function,
  user: User
}

export interface MenuState {
  
}

export interface HeaderProps {
  logout: Function,
  fetchUserRequests: Function,
  friendsRequests: FriendRequest[],
  products: ProductsMap,
  i18n: any,
  user: User,
  history: any,
  withRouter: Function,
  t: Function,
  userRequests: User[]
}

export interface HeaderState {
}

export interface AppsProps {
  i18n: any,
  t: Function,
  user: User
}

import Category from "../types/Category";
import ExchangeRequest from "../types/ExchangeRequest";
import FriendRequest from "../types/FriendRequest";
import LoanRequest from '../types/LoanRequest';
import Product from "../types/Product";
import ProductsMap from "../types/ProductsMap";
import Subcategory from '../types/Subcategory';
import User from "../types/User";

export interface AddProductProps {
  addProduct: Function,
  addRegisteredProduct: Function,
  categories: Category[],
  history: any,
  products: ProductsMap,
  subcategories: Subcategory[],
  user: User,
}

export interface ProductState {
}

export interface ProductProps {
  categories: Category[],
  subcategories: Subcategory[],
  match: any,
  products: ProductsMap,
  product?: Product,
  showCost?: boolean,
  updateProduct: Function,
  user: User
}

export interface ProductsProps {
  categories: Category[],
  deleteRequest: Function,
  deleteRequestLoan: Function,
  exchangeRequests: ExchangeRequest[],
  loanRequests: LoanRequest[],
  friends: User[],
  history: any,
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
  exchangeRequests: ExchangeRequest[],
  loanRequests: LoanRequest[],
  friendsRequests: FriendRequest[],
  pendingProducts: Product[],
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

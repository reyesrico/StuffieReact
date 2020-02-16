import Category from '../types/Category';
import ProductsMap from '../types/ProductsMap';
import User from '../types/User';

export interface AddCategoryProps {
  fetchCategories: Function,
  fetchSubCategories: Function,
  type: string
}

export interface ContentProps {
  user: User
}

export interface FriendsProps {
  t: Function,
  friends: any,
  user: User
}

export interface CategoryPageProps {
  products: ProductsMap,
  match: any,
  location: any
}

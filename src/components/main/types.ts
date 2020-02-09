import Category from "../types/Category";
import ProductsMap from "../types/ProductsMap";
import Subcategory from '../types/Subcategory';
import User from "../types/User";

export interface MainRoutesProps {
  user: User,
  products: ProductsMap,
  categories: Category[],
  subcategories: Subcategory[],
}

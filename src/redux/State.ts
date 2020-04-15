// Components for State
import User from '../components/types/User';
import Category from '../components/types/Category';
import SubCategory from '../components/types/Subcategory';

export default interface State {
  user: User,
  userRequests: User[],
  categories: Category[],
  subcategories: SubCategory[],
  friends: User[],
  products: any
}

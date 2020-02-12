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
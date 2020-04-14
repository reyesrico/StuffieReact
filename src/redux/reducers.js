import { combineReducers } from 'redux';
import { REVOKE_USER } from './constants';
import categories from './categories/reducer';
import friends from './friends/reducer';
import products from './products/reducer';
import subcategories from './subcategories/reducer';
import user from './user/reducer';
import userRequests from './user-requests/reducer';


const appReducer = combineReducers({
  user,
  userRequests,
  categories,
  friends,
  products,
  subcategories,
});

const rootReducer = (state, action) => {
  if (action.type === REVOKE_USER) {
    // Reducers are supposed to return the initial state when
    // they are called with undefined as the first argument.
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;

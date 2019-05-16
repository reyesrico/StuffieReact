import { combineReducers } from 'redux';
import categories from './categories/reducer';
import friends from './friends/reducer';
import products from './products/reducer';
import subcategories from './subcategories/reducer';

const REVOKE_USER = 'STUFFIE::REVOKE_USER';

const appReducer = combineReducers({
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

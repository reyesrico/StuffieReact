import { useSelector as originalUseSelector,
         useDispatch as originaluseDispatch } from 'react-redux';

export const useSelector = state => originalUseSelector(state);
export const useDispatch = () => originaluseDispatch();

// This helper was used with Enzyme-based tests that are now deprecated.
// It needs to be rewritten for React Testing Library if still needed.
export const mountReactHook = () => {
  const componentHook = {};
  const componentMount = null;
  return { componentMount, componentHook };
};

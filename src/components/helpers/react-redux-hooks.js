import { useSelector as originalUseSelector,
         useDispatch as originaluseDispatch } from 'react-redux';

import { act, shallow } from '@testing-library/react-hooks';

export const useSelector = state => originalUseSelector(state);
export const useDispatch = () => originaluseDispatch();

export const mountReactHook = hook => {
  const Component = ({ children }) => children(hook());
  const componentHook = {};
  let componentMount;

  act(() => {
    componentMount = shallow(
      // eslint-disable-next-line react/react-in-jsx-scope
      <Component>
        {hookValues => {
          Object.assign(componentHook, hookValues);
          return null;
        }}
      </Component>
    );
  });
  return { componentMount, componentHook };
};

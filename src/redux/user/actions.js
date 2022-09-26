import { makeStandardActionCreator } from '../action-helpers';

import { REVOKE_USER } from '../constants';
import {
  LOGIN_USER_FETCHED,
  USER_FETCHED,
  USER_REGISTERED,
  USER_PICTURE_ADDED,
  USER_UPDATED
} from './constants';
import {
  loginStuffier,
  getStuffier,
  registerStuffier,
  updateStuffier
} from '../../services/stuffier';

export const loginUserFetched = makeStandardActionCreator(LOGIN_USER_FETCHED);
export const loginUser = (email, password) => dispatch => {
  return loginStuffier(email, password).then(data => {
    // dispatch(loginUserFetched(data, { email, password }));   // NOT NEEDED
    return Promise.resolve(data);
  });
};

export const loginUserHook = (email, password) => {
  return loginStuffier(email, password);
};


// https://reactgo.com/redux-hooks-fetch-data/
const userFetched = makeStandardActionCreator(USER_FETCHED);
export const fetchUser = (email) => dispatch => {   //makePaginatedApiActionCreator(getStuffier, userFetched);
  return getStuffier(email).then(res => {
    // TODO: Promise resolve only data about User!!!
    dispatch(userFetched(res.data[0], email));
    return Promise.resolve(res);
  });
}

// https://kurthutten.com/blog/react-hook-lazy-loading-pattern/
export const fetchUserHook = (email, setIsLoading, dispatch) => {
  setIsLoading(true);
  return getStuffier(email)
    .then(res => dispatch(userFetched(res.data[0], email)))
    .catch(err => err)
    .finally(() => setIsLoading(false));
}

export const fetchUserHookWithMessage = (email, setIsLoading, setMessage, dispatch) => {
  setIsLoading(true);
  return getStuffier(email)
    .then(res => {
      dispatch(userFetched(res.data[0], email));
      setMessage("Login successful");
    })
    .catch(_ => setMessage("Error: Couldn't login. Try again."))
    .finally(() => setIsLoading(true));
}

const userRegistered = makeStandardActionCreator(USER_REGISTERED);
export const registerUser = (user) => dispatch => {
  return registerStuffier(user)
    .then(() => dispatch(userRegistered(user, user.email)))
    .catch(err => err);
}

export const registerUserHook = (user, setIsLoading, setMessage) => dispatch => {
  setIsLoading(true);
  return registerStuffier(user)
    .then(() => dispatch(userRegistered(user, user.email)))
    .then(() => {
      localStorage.setItem('username', (user.email || ''));
      setMessage("Register Successful. Request to be accepted by Admin. Do not login yet!");
    })
    .catch(err => setMessage(`Error: Couldn't register. Try again. ${err}`))
    .finally(() => setIsLoading(false));
}

// NOT GOING TO USE DATABASE TO STORE PICTURE
// I AM GOING TO USE ID FOR SAVING AND GETTING PICTURE
// UPDATE USER IS NOT CALLED AND USED YET!
export const userUpdated = makeStandardActionCreator(USER_UPDATED);
export const updateUser = (user) => dispatch => {
  // setIsLoading(true);
  updateStuffier(user)
    .then(res => {
      console.log({ userUpdated: res.data });
      dispatch(userUpdated(res.data));
    });
    // .catch(err => setMessage(`Error: Couldn't update user. ${err}`))
    // .finally(() => setIsLoading(false));
}

const userPictureAdded = makeStandardActionCreator(USER_PICTURE_ADDED);
export const addUserPicture = (user, picture) => dispatch => {
  const facebookUser = { ...user, picture };
  dispatch(userPictureAdded(facebookUser, facebookUser.email));
}

export const logout = () => {
  localStorage.removeItem('picture');
  localStorage.removeItem('username');
  window.sessionStorage.clear();

  return {
    type: REVOKE_USER,
  };
}

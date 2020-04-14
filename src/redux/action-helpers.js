import axios from 'axios';

// Inspired by https://github.com/acdlite/flux-standard-action and
// https://redux-actions.js.org/docs/api/createAction.html

// Returns an action creator that stores the first argument (probably an object, so you can store multiple key-values
// and destructure) as the action.payload. And the second argument as action.meta; meta can be useful to provide the
// reducer with request parameters that aren't included in a payload returned by the server, for example.
export const makeStandardActionCreator = (ACTION_TYPE) => {
  return (payload, meta) => ({
    meta,
    payload,
    type: ACTION_TYPE,
  });
};

// TODO: Make all to use this for args!!
// CREATE FUNCTION TO RECEIVE ARRAY OF ARGS AND NOT ONLY ONE
// To make action creators that make an API call and dispatch an action creator on success with the response.
// Doesn't handle dispatching for errors.
export const makeApiActionCreator = (apiCall, successActionCreator) => {
  return (...args) => dispatch => {
    return apiCall(...args).then(({ data }) => {
      dispatch(successActionCreator(data, {...args}));
      return Promise.resolve(data);
    });
  };
};

export const makePaginatedApiActionCreator = (apiCall, successActionCreator, requestActionCreator) => {
  return args => (dispatch) => {
    const dispatchResultsAndFetchNextIfPresent = ({ data }) => {
      dispatch(successActionCreator(data, args));
      if (data.next) {
        return axios.get(data.next).then(dispatchResultsAndFetchNextIfPresent);
      } else {
        return Promise.resolve({ data });
      }
    };

    if (requestActionCreator) {
      dispatch(requestActionCreator(undefined, args));
    }
    return apiCall(args).then(dispatchResultsAndFetchNextIfPresent);
  };
};

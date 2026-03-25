import { SPOTIFY_FETCHED } from './constants';

const spotifyReducer = (state = [], action) => {
  switch (action.type) {
    case SPOTIFY_FETCHED:
      return action.payload;
    default:
      return state;
  }
};

export default spotifyReducer;

import { SPOTIFY_FETCHED } from './constants';

const spotifyReducer = (state = [], action) => {
  switch (action.type) {
    case SPOTIFY_FETCHED:
      console.log(action.payload);
      return action.payload;
    default:
      return state;
  }
};

export default spotifyReducer;

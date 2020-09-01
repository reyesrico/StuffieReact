import { makeStandardActionCreator } from '../action-helpers';
import { SPOTIFY_FETCHED } from './constants';
import { fetchSpotifyData } from '../../services/spotify';

const spotifyFetched = makeStandardActionCreator(SPOTIFY_FETCHED);
export const fetchSpotify = () => dispatch => {
  return fetchSpotifyData()
  .then(res => {
    const conf = res.data[0];
    dispatch(spotifyFetched(conf));
    Promise.resolve(conf);
  })
  .catch(error => Promise.reject(error));
}

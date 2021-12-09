import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';

import State from '../../redux/State';
import { getToken, search, getPlaylists, getTracksFromPlaylist } from '../../services/spotify';

import './Spotify.scss';

const Spotify = () => {
  const spotifyConf = useSelector((state: State) => state.spotifyConf);

  let [ accessToken, setAccessToken ] = useState(null);
  let [ expiresIn, setExpiresIn ] = useState(null);
  let [ items, setItems ] = useState([]);
  let [ tracks, setTracks ] = useState([]);
  let [ albums, setAlbums ] = useState([]);
  let [ currentTrack, setCurrentTrack ] = useState(0);

  useEffect(() => {
    getToken(spotifyConf.key, spotifyConf.secret)
      .then((res: any) => {
        let data = res.data;
        setAccessToken(data.access_token);
        setExpiresIn(data.expires_in);
        return Promise.resolve(data.access_token);
      })
      .then(token => getPlaylists(token))
      .then(res => {
        const playlists = res.data.items;
        const rockPlaylist = playlists.find((item: any) => item.name === 'Rock');
        return Promise.resolve(rockPlaylist)
      })
      .then(playlist => getTracksFromPlaylist(accessToken, playlist.id))
      .then(res => {
        console.log(res.data);
        const items = res.data.items;
        const tracks = items.filter((item: any) => item.track.preview_url !== null).map((item: any) => item.track.preview_url);
        const albums = items.filter((item: any) => item.track.album.images[0] !== null).map((item: any) => item.track.album.images[0]);
        setTracks(tracks);
        setAlbums(albums);
        return search(accessToken, 'Musica Ligera', 'Soda Stereo');
      })
      .then(res => setItems(res.data.tracks.items));
  });

  const handleTrack = (_: any) => {
    let newTrack = currentTrack + 1;
    if (newTrack === tracks.length) {
      newTrack = 0;
    }
    setCurrentTrack(newTrack);
  }

  if (!items.length) return <div></div>;
  let image = get(items[0], 'album.images[0]');

  return (
    <div className="spotify">
      {image && <img src={albums[currentTrack]} height="30" width="30" alt={""} />}
      <audio
        aria-label="Label"
        autoPlay={false}
        className="spotify__audio"
        controls={true}
        src={tracks[currentTrack]}
      />
      <button onClick={handleTrack}>Next</button>
    </div>
  );
}

export default Spotify;

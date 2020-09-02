import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import State from '../../redux/State';
import { getToken, search, getPlaylists, getTracksFromPlaylist } from '../../services/spotify';

import './Spotify.scss';

class SpotifyComponent extends Component<any, any> {
  state = {
    accessToken: null,
    expiresIn: null,
    items: [],
    tracks: [],
    albums: [],
    currentTrack: 0
  }

  componentDidMount() {
    const { spotifyConf } = this.props;

    getToken(spotifyConf.key, spotifyConf.secret)
      .then((res: any) => {
        this.setState({ accessToken: res.data.access_token, expiresIn: res.data.expires_in });
        return Promise.resolve(res.data.access_token);
      })
      .then(token => getPlaylists(token))
      .then(res => {
        const playlists = res.data.items;
        const rockPlaylist = playlists.find((item: any) => item.name === 'Rock');
        return Promise.resolve(rockPlaylist)
      })
      .then(playlist => {
        return getTracksFromPlaylist(this.state.accessToken, playlist.id);
      })
      .then(res => {
        console.log(res.data);
        const items = res.data.items;
        const tracks = items.filter((item: any) => item.track.preview_url !== null).map((item: any) => item.track.preview_url);
        const albums = items.filter((item: any) => item.track.album.images[0] !== null).map((item: any) => item.track.album.images[0]);
        this.setState({ tracks, albums });
        return search(this.state.accessToken, 'Musica Ligera', 'Soda Stereo');
      })
      .then(res => this.setState({ items: res.data.tracks.items }));
  }

  handleTrack = () => {
    const { currentTrack, tracks } = this.state;
    let newTrack = currentTrack + 1;

    if (newTrack === tracks.length) {
      newTrack = 0;
    }

    this.setState({ currentTrack: newTrack });
  }

  render() {
    const { albums, currentTrack, tracks, items } = this.state;

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
        <button onClick={event => event && this.handleTrack()}>Next</button>
      </div>
    );  
  }
}

const mapStateToProps = (state: State) => ({
  spotifyConf: state.spotifyConf
});

export default connect(mapStateToProps, null)(SpotifyComponent);

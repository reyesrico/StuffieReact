import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import State from '../../redux/State';
import { getToken, search } from '../../services/spotify';

import './Spotify.scss';

class SpotifyComponent extends Component<any, any> {
  state = {
    accessToken: null,
    expiresIn: null,
    items: []
  }

  componentDidMount() {
    const { spotifyConf } = this.props;

    getToken(spotifyConf.key, spotifyConf.secret)
      .then((res: any) => {
        this.setState({ accessToken: res.data.access_token, expiresIn: res.data.expires_in });
        return Promise.resolve(res.data.access_token);
      })
      .then(token => search(token, 'Musica Ligera', 'Soda Stereo'))
      .then(res => this.setState({ items: res.data.tracks.items }));
  }

  render() {
    const { items } = this.state;

    if (!items.length) return <div></div>;

    let image = get(items[0], 'album.images[0]');

    return (
      <div className="spotify">
        {image && <img src={get(image, 'url')} height="30" width="30" alt={""} />}
        <audio
          aria-label="Label"
          autoPlay={false}
          className="spotify__audio"
          controls={true}
          src={get(items[0], 'preview_url')}
        />
      </div>
    );  
  }
}

const mapStateToProps = (state: State) => ({
  spotifyConf: state.spotifyConf
});

export default connect(mapStateToProps, null)(SpotifyComponent);

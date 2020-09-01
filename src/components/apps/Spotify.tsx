import React, { Component } from 'react';
import { getToken, search } from '../../services/spotify';
import { get } from 'lodash';

class SpotifyComponent extends Component {
  state = {
    accessToken: null,
    expiresIn: null,
    items: []
  }

  componentDidMount() {
    getToken()
      .then((res: any) => {
        this.setState({ accessToken: res.data.access_token, expiresIn: res.data.expires_in });
        return Promise.resolve(res.data.access_token);
      })
      .then(token => search(token, 'Musica Ligera', 'Soda Stereo'))
      .then(res => this.setState({ items: res.data.tracks.items }));
  }

  renderSong() {
    const { items } = this.state;

    if (items.length) {
      let image = get(items[0], 'album.images[0]');

      return (
        <div>
          {image && <img src={get(image, 'url')} height={get(image, 'height')} width={get(image, 'width')} alt={""} />}
          <audio
            aria-label="Label"
            autoPlay={true}
            controls={true}
            src={get(items[0], 'preview_url')}
          />
        </div>
      );  
    }
  }

  render() {
    return (
      <div>
        <div>Spotify!!</div>
        {this.renderSong()}
      </div>
      );
  }
}

export default SpotifyComponent;

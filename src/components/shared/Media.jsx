import React, { Component } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';

import config from '../../services/config';
import { existImage } from '../../services/cloudinary-helper';
import './Media.scss';

class Media extends Component {
  state = {
    imageUrl: 'default_product'
  }

  componentDidMount() {
    this.props.format !== 'mp4' && this.setUrl();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileName !== this.props.fileName) {
      this.props.format !== 'mp4' && this.setUrl();
    }
  }

  setUrl = () => {
    const { fileName, category, subcategory, isProduct } = this.props;

    if (isProduct && category && subcategory) {
      const imageUrl = `products/${category}/${subcategory}/${fileName}`;
      existImage(imageUrl)
      .then(() => this.setState({ imageUrl }))
      .catch(() => this.setState({ imageUrl: 'default_product' }));
    } else {
      this.setState({ imageUrl: fileName });
    }
  }

  renderImage = () => {
    const { format, width } = this.props;
    const { imageUrl } = this.state;
    const f = imageUrl === 'default_product' ? 'png' : format;

    return (
      <div className="media__image">
        <Image publicId={imageUrl} format={f}>
          <Transformation width={width} fetchFormat="auto" crop="scale" />
      </Image>
      </div>
    );
  }

  renderVideo = () => {
    const { fileName, format } = this.props;
    return (<Video publicId={fileName} format={format}></Video>);
  }
  
  render() {
    const isVideo = this.props.format === 'mp4';

    return (
      <CloudinaryContext cloudName={config.cloudinary.cloudName}>
        {isVideo && this.renderVideo()}
        {!isVideo && this.renderImage()}
      </CloudinaryContext>
    );
  }
}

export default Media;

import React, { Component } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';
import config from '../../services/config';
import './Media.scss';

class Media extends Component {

  renderImage = () => {
    const { fileName, format, category, width, subcategory, isProduct } = this.props;
    const file = isProduct? category && subcategory ? `products/${category}/${subcategory}/${fileName}` : 'default_product' : fileName;
    const f = file === 'default_product' ? 'png' : format;

    return (
      <div className="media__image">
        <Image publicId={file} format={f}>
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
    const { format } = this.props;

    const media = format === 'mp4' ? this.renderVideo() : this.renderImage();

    return (
      <CloudinaryContext cloudName={config.cloudinary.cloudName}>
        {media}
      </CloudinaryContext>
    );
  }
}

export default Media;

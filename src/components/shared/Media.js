import React, { Component } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';
import config from '../../services/config';

class Media extends Component {
  renderImage = () => {
    const { fileName, format, height, width, category, subcategory, isProduct } = this.props;
    const file = isProduct? category && subcategory ? `products/${category}/${subcategory}/${fileName}` : 'default_product' : fileName;
    const f = file === 'default_product' ? 'png' : format;

    return (
      <Image publicId={file} format={f}>
      { width && height &&
        (<Transformation crop="fill" gravity="faces" width={width} height={height}/>)
      }
      </Image>
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

import React, { useEffect, useRef, useState } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';

import config from '../../services/config';
import { existImage } from '../../services/cloudinary-helper';
import './Media.scss';

const Media = (props: any) => {
  let { format } = props;
  let [imageUrl, setImageUrl] = useState('default_product');

  const didMountRef = useRef(false);
  const prevProps = useRef(props);

  useEffect(() => {
    // componentDidUpdate
    if (didMountRef.current) {
      if (prevProps.current.fileName !== props.fileName) {
        if (format !== 'mp4') {
          setUrl();
        }
      }
    } else {
      if (format !== 'mp4') {
        setUrl();
      }
      didMountRef.current = true;
    }
  });

  const setUrl = () => {
    const { fileName, category, subcategory, isProduct } = props;

    if (isProduct && category && subcategory) {
      const imageUrl = `products/${category}/${subcategory}/${fileName}`;
      existImage(imageUrl)
        .then(() => setImageUrl(imageUrl))
        .catch(() => setImageUrl('default_product'));
    } else {
      setImageUrl(fileName);
    }
  }

  const renderImage = () => {
    const { format, width } = props;
    const f = imageUrl === 'default_product' ? 'png' : format;

    return (
      <div className="media__image">
        <Image publicId={imageUrl} format={f}>
          <Transformation width={width} fetchFormat="auto" crop="scale" />
        </Image>
      </div>
    );
  }

  const renderVideo = () => {
    const { fileName, format } = props;
    return (<Video publicId={fileName} format={format}></Video>);
  }

  const isVideo = props.format === 'mp4';
  return (
    <CloudinaryContext cloudName={config.cloudinary.cloudName}>
      {isVideo && renderVideo()}
      {!isVideo && renderImage()}
    </CloudinaryContext>
  );
}

export default Media;

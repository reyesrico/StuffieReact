import React, { useEffect, useRef, useState } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';

import config from '../../services/config';
import { existImage } from '../../services/cloudinary-helper';
import './Media.scss';

const Media = (props: any) => {
  const { format, fileName, isLogo, width } = props;
  const [imageUrl, setImageUrl] = useState('default_product');
  const f = imageUrl === 'default_product' ? 'png' : format;

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
    const { fileName, category, subcategory, isProduct, isLogo } = props;

    if (isProduct && category && subcategory) {
      const imageUrl = `products/${category}/${subcategory}/${fileName}`;
      existImage(imageUrl)
        .then(() => setImageUrl(imageUrl))
        .catch(() => setImageUrl('default_product'));
    } else if (!isLogo) {
      setImageUrl(fileName);
    }
  }

  const publicId = React.useMemo(() => {
    return isLogo ? fileName : imageUrl;
  }, [fileName, isLogo, imageUrl]);


  const renderVideo = () => {
    const { fileName, format } = props;
    return (<Video publicId={fileName} format={format}></Video>);
  }

  const isVideo = props.format === 'mp4';
  return (
    <CloudinaryContext cloudName={config.cloudinary.cloudName}>
      {isVideo && renderVideo()}
      {!isVideo && (
        <div className="media__image">
        <Image publicId={publicId} format={f}>
          <Transformation width={width} fetchFormat="auto" crop="scale" />
        </Image>
      </div>
      )}
    </CloudinaryContext>
  );
}

export default Media;

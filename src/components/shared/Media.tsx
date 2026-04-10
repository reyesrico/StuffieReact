import React, { useEffect, useRef, useState } from 'react';
import { Image, Video, Transformation, CloudinaryContext } from 'cloudinary-react';

import config from '../../config/api';
import { existImage } from '../../lib/cloudinary';
import './Media.scss';

// Maps current subcategory_id values to the Cloudinary folder names used at upload time.
// The old folder scheme was {cat_id}{seq}000; new subcategory IDs are cat_id*100+seq.
const SUBCATEGORY_FOLDER: Record<number, string> = {
  101: '11000', // Jerseys        (cat 1)
  201: '21000', // Books          (cat 2)
  301: '31000', // Movies         (cat 3)
  401: '41000', // Consoles       (cat 4)
  402: '42000', // Games          (cat 4)
  403: '43000', // Computers      (cat 4)
  404: '44000', // Printers       (cat 4)
  405: '45000', // TVs            (cat 4)
  406: '46000', // Mobiles        (cat 4)
  501: '51000', // Home Furniture (cat 5)
};

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
    const { fileName, category, subcategory, isProduct, isLogo, imageKey } = props;

    if (imageKey) {
      // Use the stored Cloudinary path directly (source of truth, strips extension for publicId)
      const publicPath = String(imageKey).replace(/\.[^.]+$/, '');
      existImage(publicPath)
        .then(() => setImageUrl(publicPath))
        .catch(() => setImageUrl('default_product'));
    } else if (isProduct && category && subcategory) {
      const folder = SUBCATEGORY_FOLDER[subcategory] ?? subcategory;
      const imageUrl = `products/${category}/${folder}/${fileName}`;
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
    return (<Video publicId={fileName} format={format} />);
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

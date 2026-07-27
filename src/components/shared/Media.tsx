import React, { useEffect, useRef, useState } from 'react';
import { AdvancedImage, AdvancedVideo } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { format as deliveryFormat } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';

import config from '../../config/api';
import { existImage } from '../../lib/cloudinary';
import './Media.scss';

const cld = new Cloudinary({ cloud: { cloudName: config.cloudinary.cloudName } });

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
    const { fileName } = props;
    const video = cld.video(fileName);
    return (<AdvancedVideo cldVid={video} />);
  }

  const isVideo = props.format === 'mp4';

  const renderImage = () => {
    const image = cld.image(publicId);
    if (width) {
      image.resize(scale().width(width));
    }
    if (f) {
      image.format(f);
    } else {
      image.delivery(deliveryFormat(auto()));
    }
    return (<AdvancedImage cldImg={image} />);
  }

  return (
    <>
      {isVideo && renderVideo()}
      {!isVideo && (
        <div className="media__image">
          {renderImage()}
        </div>
      )}
    </>
  );
}

export default Media;

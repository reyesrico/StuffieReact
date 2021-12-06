import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import { LoadingProps, LoadingSize } from './types';

import './Loading.scss';

const getSize = (size: LoadingSize) => {
  switch (size) {
    case 'sm':
      return 8;
    case 'md':
      return 16;
    case 'lg':
      return 32;
    case 'xl':
      return 64;
    default:
      return 16;
  }
}

const Loading = (props: LoadingProps) => {
  let [message] = useState(props.message);
  let size = getSize(props.size || 'md');

  return (
    <div className="stuffie-loading">
      <ReactLoading type="spin" color="#00f" height={size} width={size} />
      {message && (<div className="stuffie-loading__message">{message}</div>)}
    </div>
  );
}

export default Loading;

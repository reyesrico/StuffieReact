import React from 'react';
import { WarningMessageProps } from './types';
import './WarningMessage.scss';

const WarningMessage = (props: WarningMessageProps) => {
  const { message, type } = props;

  if (!message) return <div></div>

  return (
    <div className={`warning-message warning-message__${type}`}>
      {message}
    </div>
  );
}

export default WarningMessage;

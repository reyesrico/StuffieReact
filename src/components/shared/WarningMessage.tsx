import React, { Component } from 'react';
import { WarningMessageProps } from './types';
import './WarningMessage.scss';

class WarningMessage extends Component<WarningMessageProps, any> {
  render() {
    const { message, type } = this.props;

    if (!message) return <div></div>

    return (
      <div className={`warning-message warning-message__${type}`}>
        {message}
      </div>
    );
  }
}

export default WarningMessage;

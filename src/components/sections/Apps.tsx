import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Apps.scss';

class Apps extends Component<any, any> {
  render() {
    return (
      <div className="apps">
        <div className="apps__title">Apps &amp; extras</div>
        <div className="apps__item"><Link to='/tickets'>Tickets</Link></div>
        <div className="apps__item"><Link to='/support'>Support</Link></div>
        <div className="apps__item"><Link to='/charts'>Charts</Link></div>
        <div className="apps__item"><Link to='/test'>Test</Link></div>
      </div>
    );
  }
};

export default Apps;

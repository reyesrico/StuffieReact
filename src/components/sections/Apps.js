import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Apps extends Component {
  render() {
    return (
      <div className="apps">
        <div className='appsItem'><Link to='/tickets'>Tickets</Link></div>
        <div className='appsItem'><Link to='/chat'>Chat</Link></div>
        <div className='appsItem'><Link to='/charts'>Charts</Link></div>
        <div className='appsItem'><Link to='/test'>Test</Link></div>
      </div>
    );
  }
};

export default Apps;

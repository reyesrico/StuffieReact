import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import Media from '../shared/Media';
import './Header.css';

class Header extends Component {
  handleLogout = event => {
    const { history } = this.props;

    event.preventDefault();
    localStorage.setItem('username', '');
    history.push('/login');
  }

  render() {
    const { user } = this.props;

    return (
      <div className="stuffie-header">
        <div className="stuffie-header__info">
          <div className="stuffie-header__logo">
            <Media fileName="logo" format="jpg" height="50" width="50" />
          </div>
          <div className='stuffie-header__user'>
            {(user && user.first_name) || ''} Stuff
          </div>
        </div>
        <div className='stuffie-header__sections'>
          <div className='stuffie-header__section-item'><Link to='/'>Feed</Link></div>
          <div className='stuffie-header__section-item'><Link to='/friends'>Friends</Link></div>
          <div className='stuffie-header__section-item'><Link to='/products'>Products</Link></div>
        </div>
        <div className="stuffie-header__logout" onClick={this.handleLogout}>Logout</div>
      </div>
    );
  }
};

export default withRouter(Header);

import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { HeaderProps, HeaderState } from './types';
import Search from './Search';
import Media from '../shared/Media';
import './Header.scss';

class Header extends Component<HeaderProps, HeaderState> {
  handleLogout = (event: any) => {
    const { history } = this.props;

    event.preventDefault();
    localStorage.setItem('username', '');
    history.push('/login');
  }

  render() {
    const { t, user } = this.props;

    if (!t) return;

    return (
      <div className="stuffie-header">
        <div className="stuffie-header__left">
          <div className="stuffie-header__info">
            <div className="stuffie-header__logo">
              <Media fileName="logo_2020" format="jpg" height="50" width="50" />
            </div>
            <div className='stuffie-header__user'>Stuffie</div>
          </div>
          <div className='stuffie-header__sections'>
            <div className='stuffie-header__section-item'><Link to='/'>{t('Feed')}</Link></div>
            <div className='stuffie-header__section-item'><Link to='/friends'>{t('Friends')}</Link></div>
            <div className='stuffie-header__section-item'><Link to='/products'>{t('Products')}</Link></div>
            {user.admin && <div className='stuffie-header__section-item'><Link to='/admin'>{t('Admin')}</Link></div>}
            <div className="stuffie-header__logout"><a onClick={this.handleLogout}>{t('Logout')}</a></div>
          </div>
        </div>
        <div className="stuffie-header__search">
          <Search></Search>
        </div>
      </div>
    );
  }
};

export default withTranslation()<any>(withRouter<any, React.ComponentClass<any>>(Header));

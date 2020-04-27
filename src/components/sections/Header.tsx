import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Media from '../shared/Media';
import SearchBar from '../shared/SearchBar';
import State from '../../redux/State';
import { HeaderProps, HeaderState } from './types';
import { logout } from '../../redux/user/actions';
import './Header.scss';

class Header extends Component<HeaderProps, any> {
  handleLogout = (event: any) => {
    const { logout, history } = this.props;

    event.preventDefault();

    logout();
    history.push('/');
  }

  render() {
    const { friendsRequests, exchangeRequests, pendingProducts, products, t, user, userRequests } = this.props;
    const exchangeClass = exchangeRequests.length > 0 ? "stuffie-header__section-exchange" : "";

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
            <div className='stuffie-header__section-item'>
              <Link to='/friends'>{t('Friends')}</Link>
              {friendsRequests.length > 0 && (<div className="stuffie-header__warning">{friendsRequests.length}</div>)}
            </div>
            <div className={`stuffie-header__section-item ${exchangeClass}`}>
              <Link to='/products'>{t('Products')}</Link>
              {exchangeRequests.length > 0 && (<div className="stuffie-header__warning">{exchangeRequests.length}</div>)}
            </div>
            {user.admin && (
              <div className='stuffie-header__section-item'>
                <Link to='/admin'>{t('Admin')}</Link>
                { (userRequests.length > 0 || pendingProducts.length > 0) &&
                  (<div className="stuffie-header__warning">{userRequests.length + pendingProducts.length}</div>)
                }
              </div>
            )}
            <div className="stuffie-header__logout"><a onClick={this.handleLogout}>{t('Logout')}</a></div>
          </div>
        </div>
        <div className="stuffie-header__search">
          <SearchBar products={products}></SearchBar>
          <div className="stuffie-header__menu"><Media fileName="lines" format="png" height="50" width="50"/></div>
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  userRequests: state.userRequests,
  friendsRequests: state.friendsRequests,
  products: state.products,
  exchangeRequests: state.exchangeRequests,
  pendingProducts: state.pendingProducts,
});

const mapDispatchProps = {
  logout
};

export default connect(mapStateToProps, mapDispatchProps)(withTranslation()<any>(withRouter<any, React.ComponentClass<any>>(Header)));

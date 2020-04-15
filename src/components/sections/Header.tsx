import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Media from '../shared/Media';
import SearchBar from '../shared/SearchBar';
import State from '../../redux/State';
import { HeaderProps, HeaderState } from './types';
import { logout } from '../../redux/user/actions';
import { fetchUserRequests } from '../../redux/user-requests/actions';
import './Header.scss';

class Header extends Component<HeaderProps, any> {
  state = {
    userRequests: []
  };

  componentDidMount() {
    const { fetchUserRequests, user, userRequests } = this.props;
    
    if (userRequests && userRequests.length === 0) {
      user.admin && fetchUserRequests().then((res: any) => this.setState({ userRequests: res }));
    } else {
      this.setState({ userRequests });
    }
  }

  componentWillReceiveProps(nextProps: HeaderProps) {
    this.setState({ userRequests: nextProps.userRequests });
  }

  handleLogout = (event: any) => {
    const { logout, history, setUser } = this.props;

    event.preventDefault();

    logout();
    setUser({});
    history.push('/');
  }

  render() {
    const { userRequests } = this.state;
    const { friendsRequests, products, t, user } = this.props;

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
            <div className='stuffie-header__section-item'><Link to='/products'>{t('Products')}</Link></div>
            {user.admin && (
              <div className='stuffie-header__section-item'>
                <Link to='/admin'>{t('Admin')}</Link>
                {userRequests.length > 0 && (<div className="stuffie-header__warning">{userRequests.length}</div>)}
              </div>
            )}
            <div className="stuffie-header__logout"><a onClick={this.handleLogout}>{t('Logout')}</a></div>
          </div>
        </div>
        <div className="stuffie-header__search">
          <SearchBar products={products}></SearchBar>
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  userRequests: state.userRequests,
});

const mapDispatchProps = {
  fetchUserRequests,
  logout
};

export default connect(mapStateToProps, mapDispatchProps)(withTranslation()<any>(withRouter<any, React.ComponentClass<any>>(Header)));

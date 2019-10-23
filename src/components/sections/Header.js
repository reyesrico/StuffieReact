import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { options } from '../../config/options';

import Menu from '../shared/Menu';
import Media from '../shared/Media';
import './Header.scss';

class Header extends Component {
  state = {
    lang: options[0]
  };

  changeLang = lang => {
    const { i18n } = this.props;

    this.setState({ lang });
    i18n.changeLanguage(lang.value);
  };

  handleLogout = event => {
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
        <div className="stuffie-header__info">
          <div className="stuffie-header__logo">
            <Media fileName="logo" format="jpg" height="50" width="50" />
          </div>
          <div className='stuffie-header__user'>
            {(user && user.first_name) || ''} Stuff
          </div>
        </div>
        <div className='stuffie-header__sections'>
          <div className='stuffie-header__section-item'><Link to='/'>{t('Feed')}</Link></div>
          <div className='stuffie-header__section-item'><Link to='/friends'>{t('Friends')}</Link></div>
          <div className='stuffie-header__section-item'><Link to='/products'>{t('Products')}</Link></div>
        </div>
        <div className="stuffie-header__menu">
          <Menu alignment="left" label={isOpen => {
            return (
              <div className={isOpen ? 'stuffie-header__language-open' : 'stuffie-header__language'}>
                {t('Language')}
              </div>)
            }
          }>
            {options.map(option => {
              return (<div key={option.value} className="stuffie-header__option" onClick={() => this.changeLang(option)}>{option.label}</div>);
            })}
          </Menu>
          <div className="stuffie-header__logout" onClick={this.handleLogout}>{t('Logout')}</div>
        </div>
      </div>
    );
  }
};

export default withTranslation()(withRouter(Header));

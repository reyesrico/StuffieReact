import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Apps from '../sections/Apps';
import Media from '../shared/Media';
import SearchBar from '../shared/SearchBar';
import Spotify from '../apps/Spotify';
import State from '../../redux/State';
import { logout } from '../../redux/user/actions';
import './Header.scss';

const Header = () => {
  let state = useSelector((state: State) => state);
  let user = state.user;
  let userRequests = useSelector((state: State) => state.userRequests);
  let friendsRequests = useSelector((state: State) => state.friendsRequests);
  let products = useSelector((state: State) => state.products);
  let exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  let loanRequests = useSelector((state: State) => state.loanRequests);
  let pendingProducts = useSelector((state: State) => state.pendingProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const exchangeClass = exchangeRequests.length > 0 ? "stuffie-header__section-exchange" : "";
  const requests = exchangeRequests.length + loanRequests.length;

  const handleLogout = (event: any) => {
    event.preventDefault();
    dispatch(logout());
    navigate('/');
  }

  /* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
  const toggleMenu = () => {
    let x: any = document.getElementById("apps");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.cssText = `
        display: block;
        float: right;
        top: 28px; right: 0px;
        position: absolute; background-color: white;
        width: 146px;
        padding: 8px;
        box-shadow: 5px 5px #888888;
        border-radius: 6px;
      `;
    }
  }

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
          <div className='stuffie-header__section-item'><Link to='/StuffieReact'>{t('Feed')}</Link></div>
          <div className='stuffie-header__section-item'>
            <Link to='/friends'>{t('Friends')}</Link>
            {friendsRequests.length > 0 && (<div className="stuffie-header__warning">{friendsRequests.length}</div>)}
          </div>
          <div className={`stuffie-header__section-item ${exchangeClass}`}>
            <Link to='/products'>{window.outerWidth >= 1024 && !requests ? "Products" : "Prods"}</Link>
            {requests > 0 && (
              <div className="stuffie-header__warning">
                <span className="stuffie-header__warning-text">{requests}</span>
              </div>)}
          </div>
          {user.admin && (
            <div className='stuffie-header__section-item'>
              <Link to='/admin'>{t('Admin')}</Link>
              {(userRequests.length > 0 || pendingProducts.length > 0) && (
                <div className="stuffie-header__warning">
                  <span className="stuffie-header__warning-text">{userRequests.length + pendingProducts.length}</span>
                </div>)}
            </div>
          )}
          <div className="stuffie-header__section-item">
            <button className="stuffie-header__button" onClick={handleLogout}>{t('Logout')}</button>
          </div>
        </div>
      </div>
      <div className="stuffie-header__search">
        <SearchBar products={products}></SearchBar>

        {/* https://www.w3schools.com/howto/howto_js_mobile_navbar.asp */}
        <div className="stuffie-header__menu">
          <div id="apps">
            <div className="stuffie-header__menu-spotify"><Spotify /></div>
            <div className="stuffie-header__menu-apps"><Apps /></div>
          </div>
          <button className="icon" onClick={event => event && toggleMenu()}>
            <i className="fa fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
  export default Header;

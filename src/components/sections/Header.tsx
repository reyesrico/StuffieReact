import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Apps from '../sections/Apps';
import Chat from './Chat';
import Media from '../shared/Media';
import SearchBar from '../shared/SearchBar';
// import Spotify from '../apps/Spotify';
import State from '../../redux/State';
import Theme from './Theme';
import ThemeContext from '../../context/ThemeContext';
import UserContext from '../../context/UserContext';
import { logout } from '../../redux/user/actions';
import { defaultImageUrl, existImage, userImageUrl } from '../../services/cloudinary-helper';

import './Header.scss';

const Header = () => {
  const  { theme } = useContext(ThemeContext);
  const { user, logoutUser } = React.useContext(UserContext);
  // let state = useSelector((state: State) => state);
  // let user = state.user;
  let userRequests = useSelector((state: State) => state.userRequests);
  let friendsRequests = useSelector((state: State) => state.friendsRequests);
  let products = useSelector((state: State) => state.products);
  let exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  let loanRequests = useSelector((state: State) => state.loanRequests);
  let pendingProducts = useSelector((state: State) => state.pendingProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [picture, setPicture] = React.useState<string>();

  React.useEffect(() => {
    existImage(user.id, "stuffiers/")
      .then(res => {
        // console.log({ res });
        setPicture(userImageUrl(user.id));
      })
      .catch(() => setPicture(defaultImageUrl));
  }, []);

  const exchangeClass = exchangeRequests.length > 0 ? "stuffie-header__section-exchange" : "";
  const requests = exchangeRequests.length + loanRequests.length;

  const handleLogout = (event: any) => {
    event.preventDefault();
    logoutUser();
    dispatch(logout());
    navigate('/');
  }

  /* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
  const toggleApps = () => {
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

  const toggleMenu = () => {
    let x: any = document.getElementById("menu");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.cssText = `
        display: block;
        float: left;
        top: 28px; left: 0px;
        position: absolute; background-color: white;
        width: 146px;
        padding: 8px;
        box-shadow: 5px 5px #888888;
        border-radius: 6px;
      `;
    }
  }

  const logoFileName = React.useMemo(() => {
    return theme === "light" ? "logo_2020" : "logo_2020_dark";
  }, [theme])

  return (
    <div className="stuffie-header">
      <div className="stuffie-header__left">
        <div className="stuffie-header__info">
          <div className="stuffie-header__logo">
            <Media fileName={logoFileName} format="jpg" height="50" width="50" />
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
        <div className="stuffie-header__menu">
          <div id="menu">
            <div className="stuffie-header__menu-apps">
              <div className="stuffie-header__user-name">
                {picture && (
                  <Link to="/stuffier">
                    <img src={picture} className="stuffie__picture" alt="User Pic" />
                  </Link>
                )}
                <div className="stuffie__welcome">
                  {user.first_name}
                </div>
              </div>
            </div>
            <div className="stuffie-header__menu-apps">
              <Chat />
            </div>
          </div>
          <button className="icon" onClick={event => event && toggleMenu()}>
            <i className="fa fa-bars"></i>
          </button>
        </div>

        <SearchBar products={products}></SearchBar>

        {/* https://www.w3schools.com/howto/howto_js_mobile_navbar.asp */}
        <div className="stuffie-header__apps">
          <div id="apps">
            <div className="stuffie-header__menu-theme"><Theme /></div>
            <div className="stuffie-header__apps-apps"><Apps /></div>
          </div>
          <button className="icon" onClick={event => event && toggleApps()}>
            <i className="fa fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
export default Header;

import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icon } from '@fluentui/react';

import Apps from '../sections/Apps';
import Chat from './Chat';
import SearchBar from '../shared/SearchBar';
import Theme from './Theme';
import ThemeContext from '../../context/ThemeContext';
import UserContext from '../../context/UserContext';
import { 
  useUserRequests, 
  useFriendRequests, 
  useProducts, 
  useExchangeRequests, 
  useLoanRequests,
  usePendingProducts 
} from '../../hooks/queries';
import { clearAllCache } from '../../utils/cache';
import { defaultImageUrl, existImage, userImageUrl } from '../../lib/cloudinary';

import './Header.scss';

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const { user, logoutUser } = React.useContext(UserContext);
  const queryClient = useQueryClient();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // React Query hooks replace Redux selectors
  const { data: userRequests = [] } = useUserRequests();
  const { data: friendsRequests = [] } = useFriendRequests();
  const { data: products = {} } = useProducts();
  const { data: exchangeRequests = [] } = useExchangeRequests();
  const { data: loanRequests = [] } = useLoanRequests();
  const { data: pendingProducts = [] } = usePendingProducts();
  
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [picture, setPicture] = React.useState<string>();

  React.useEffect(() => {
    if (user?.id) {
      existImage(user.id, "stuffiers/")
        .then(_res => {
          setPicture(userImageUrl(user.id));
        })
        .catch(() => setPicture(defaultImageUrl));
    }
  }, [user?.id]);

  const exchangeClass = exchangeRequests.length > 0 ? "stuffie-header__section-exchange" : "";
  const requests = exchangeRequests.length + loanRequests.length;

  const handleLogout = (event: any) => {
    event.preventDefault();
    
    // Clear React Query cache
    queryClient.clear();
    
    // Clear localStorage cache  
    clearAllCache('cache_');
    localStorage.removeItem('stuffie-cache');
    localStorage.removeItem('picture');
    localStorage.removeItem('username');
    sessionStorage.clear();
    
    // Update UserContext
    logoutUser();
    
    // Navigate to login
    navigate('/login');
  }

  /* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
  const toggleApps = () => {
    const x: any = document.getElementById("apps");
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
    const x: any = document.getElementById("menu");
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

  const logoSrc = React.useMemo(() => {
    return theme === "light" 
      ? `${import.meta.env.BASE_URL}images/stuffie-logo-light.svg` 
      : `${import.meta.env.BASE_URL}images/stuffie-logo-dark.svg`;
  }, [theme])

  return (
    <div className="stuffie-header">
      <div className="stuffie-header__left">
        <div className="stuffie-header__info">
          <div className="stuffie-header__logo">
            <img src={logoSrc} alt={t('common.logoAlt')} width="42" height="42" />
          </div>
          <div className='stuffie-header__user'>Stuffie</div>
        </div>
        <div className='stuffie-header__sections'>
          <div className={`stuffie-header__section-item ${isActive('/') ? 'stuffie-header__section-item--active' : ''}`}>
            <Link to='/'>{t('Feed')}</Link>
          </div>
          <div className={`stuffie-header__section-item ${isActive('/friends') ? 'stuffie-header__section-item--active' : ''}`}>
            <Link to='/friends'>{t('Friends')}</Link>
            {friendsRequests.length > 0 && (<div className="stuffie-header__warning">{friendsRequests.length}</div>)}
          </div>
          <div className={`stuffie-header__section-item ${exchangeClass} ${isActive('/products') ? 'stuffie-header__section-item--active' : ''}`}>
            <Link to='/products'>{window.outerWidth >= 1024 && !requests ? t('header.products') : t('header.prodsShort')}</Link>
            {requests > 0 && (
              <div className="stuffie-header__warning">
                <span className="stuffie-header__warning-text">{requests}</span>
              </div>)}
          </div>
          {user.admin && (
            <div className={`stuffie-header__section-item ${isActive('/admin') ? 'stuffie-header__section-item--active' : ''}`}>
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
            <Icon iconName="GlobalNavButton" />
          </button>
        </div>

        <SearchBar products={products} />

        {/* https://www.w3schools.com/howto/howto_js_mobile_navbar.asp */}
        <div className="stuffie-header__apps">
          <div id="apps">
            <div className="stuffie-header__menu-theme"><Theme /></div>
            <div className="stuffie-header__apps-apps"><Apps /></div>
          </div>
          <button className="icon" onClick={event => event && toggleApps()}>
            <Icon iconName="GlobalNavButton" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default Header;

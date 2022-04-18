import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Apps from '../sections/Apps';
import Chat from '../sections/Chat';
import MainRoutes from './MainRoutes';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import Menu from '../sections/Menu';
// import Spotify from '../apps/Spotify';
import State from '../../redux/State';

import './Main.scss';

const Main = () => {
  const user = useSelector((state: State) => state.user);
  const { t } = useTranslation();

  return (
    <div className="stuffie">
      <div className="stuffie__header">
        <Header />
      </div>
      <div className="stuffie__main">
        <div className="stuffie__left">
          <div className="stuffie__user">
              {user.picture && (<img src={user.picture} alt="User Pic"></img>)}
              <div className="stuffie__welcome">{t('Welcome')} {user.first_name}</div>
          </div>
          <div className="stuffie__left-section">
            <Menu />
          </div>
          <div className="stuffie__left-section">
            <Chat />
          </div>
        </div>
        <div className="stuffie__content">
          <MainRoutes />
        </div>
        <div className="stuffie__right">
          {/* <div className="stuffie__spotify">
            <Spotify />
          </div> */}
          <div className="stuffie__apps">
            <Apps />
          </div>
          <div className="stuffie__chat">
            <Chat />
          </div>
        </div>
      </div>
      <div className="stuffie_footer">
        <Footer />
      </div>
    </div>
  );
}

export default Main;

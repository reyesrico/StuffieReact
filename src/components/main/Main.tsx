import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Apps from '../sections/Apps';
import Chat from '../sections/Chat';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import MainRoutes from './MainRoutes';
import Menu from '../sections/Menu';
// import Spotify from '../apps/Spotify';
import State from '../../redux/State';
import Theme from '../sections/Theme';
import {
  defaultImageUrl,
  existImage,
  userImageUrl
} from '../../services/cloudinary-helper';

import './Main.scss';

const Main = () => {
  const user = useSelector((state: State) => state.user);
  const { t } = useTranslation();
  const [picture, setPicture] = React.useState<string>();

  React.useEffect(() => {
    existImage(user.id, "stuffiers/")
      .then(res => {
        console.log({res});
        setPicture(userImageUrl(user.id));
      })
      .catch(() => setPicture(defaultImageUrl));
  }, [user]);

  return (
    <div className="stuffie">
      <div className="stuffie__header">
        <Header />
      </div>
      <div className="stuffie__main">
        <div className="stuffie__left">
          <div className="stuffie__user">
              {picture && (
                <Link to="/stuffier">
                  <img src={picture} className="stuffie__picture" alt="User Pic"/>
                </Link>
              )}
              <div className="stuffie__welcome">
                {t('Welcome')}{user.first_name}
              </div>
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
          <div className="stuffie__right-section">
            <Theme />
          </div>
          <div className="stuffie__right-section">
            <Apps />
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

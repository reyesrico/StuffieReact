import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Apps from '../sections/Apps';
import Chat from '../sections/Chat';
import MainRoutes from './MainRoutes';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import Menu from '../sections/Menu';
import State from '../../redux/State';

import { MainProps } from './types'; 
import './Main.scss';
import Spotify from '../apps/Spotify';

class Main extends Component<MainProps, any> {
  render() {
    const { user, t } = this.props;

    return (
      <div className="stuffie">
        <div className="stuffie__header">
          <Header />
        </div>
        <div className="stuffie__main">
          <div className="stuffie__menu">
            <Menu />
          </div>
          <div className="stuffie__content">
            <MainRoutes />
          </div>
          <div className="stuffie__right">
            <div className="stuffie__user">
              {user.picture && (<img src={user.picture} alt="User Pic"></img>)}
              <div className="stuffie__welcome">{t('Welcome')} {user.first_name}</div>
            </div>
            <div className="stuffie__spotify">
              <Spotify />
            </div>
            <div className="stuffie__apps">
              <Apps />
            </div>
          </div>
        </div>
        <div className="stuffie_footer">
          <Footer />
        </div>
        <Chat />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user
});

export default connect(mapStateToProps, {})(withTranslation()<any>(Main));

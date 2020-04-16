import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import Apps from '../sections/Apps';
import MainRoutes from './MainRoutes';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import Menu from '../sections/Menu';
import Chat from '../sections/Chat';

import { MainProps } from './types'; 
import './Main.scss';

class Main extends Component<MainProps, any> {
  render() {
    const { user, categories, friends, friendsRequests, products, setUser, stuff, subcategories, t } = this.props;

    return (
      <div className="stuffie">
        <div className="stuffie__header">
          <Header user={user} products={products} friendsRequests={friendsRequests} setUser={setUser} />
        </div>
        <div className="stuffie__main">
          <div className="stuffie__menu">
            <Menu products={products} />
          </div>
          <div className="stuffie__content">
            <MainRoutes
              user={user}
              stuff={stuff}
              categories={categories}
              friends={friends}
              friendsRequests={friendsRequests}
              products={products}
              subcategories={subcategories} />
          </div>
          <div className="stuffie__right">
            <div className="stuffie__user">
              {user.picture && (<img src={user.picture}></img>)}
              <div className="stuffie__welcome">{t('Welcome')} {user.first_name}</div>
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

export default withTranslation()<any>(Main);

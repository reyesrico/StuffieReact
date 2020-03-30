import React, { Component } from 'react';

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
    const { user, categories, friends, products, stuff, subcategories } = this.props;

    return (
      <div className="stuffie">
        <div className="stuffie__header">
          <Header user={user} products={products}/>
        </div>
        <div className="stuffie__main">
          <div className="stuffie__menu">
            <Menu user={user} categories={categories} products={products} />
          </div>
          <div className="stuffie__content">
            <MainRoutes
              user={user}
              stuff={stuff}
              categories={categories}
              friends={friends}
              products={products}
              subcategories={subcategories} />
          </div>
          <div className="stuffie__apps">
            <Apps user={user} />
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

export default Main;

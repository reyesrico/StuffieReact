import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import reducersApp from './redux/reducers';
import { unregister } from './serviceWorker';

import './sass/main.scss';
import './index.css';

let middleware = [thunk];
let composeEnhancers = compose;
middleware.push(require('redux-freeze'));
composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeEnhancers;

const store = createStore(reducersApp, composeEnhancers(applyMiddleware(...middleware)));

ReactDOM.render(
  <App store={ store }/>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();

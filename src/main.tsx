import React from 'react';
import { createRoot } from 'react-dom/client';
import { applyMiddleware, createStore, compose } from 'redux';
import { thunk } from 'redux-thunk';
import reduxFreeze from 'redux-freeze';

import App from './App';
import reducersApp from './redux/reducers';

import './sass/main.scss';
import './index.css';

const middleware = [thunk];
const composeEnhancers = (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
middleware.push(reduxFreeze as any);
const store = createStore(reducersApp, composeEnhancers(applyMiddleware(...middleware)));

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App store={store} />);

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import './styles/base/main.scss';
import './index.css';

// Register service worker for Web Push background notifications.
// The SW file lives at public/sw.js and is served at <BASE_URL>sw.js.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

import React from 'react';
import {
  BoxMultiple20Regular,
  ArrowSwap20Regular,
  Money20Regular,
  Gift20Regular,
  HeartPulse20Regular,
  ShieldCheckmark20Regular,
  Person20Regular,
} from '@fluentui/react-icons';
import './Footer.scss';

const YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__grid">

        {/* Brand column */}
        <div className="footer__brand">
          <div className="footer__logo">
            <BoxMultiple20Regular />
            <span className="footer__logo-text">Stuffie™</span>
          </div>
          <p className="footer__tagline">
            Manage your belongings. Trade, lend, and sell with friends.
          </p>
        </div>

        {/* Features column */}
        <div className="footer__col">
          <div className="footer__col-title">Features</div>
          <ul className="footer__list">
            <li><ArrowSwap20Regular className="footer__icon" /><span>Trade items with friends</span></li>
            <li><Gift20Regular className="footer__icon" /><span>Lend &amp; borrow</span></li>
            <li><Money20Regular className="footer__icon" /><span>Buy &amp; sell</span></li>
            <li><BoxMultiple20Regular className="footer__icon" /><span>Personal inventory</span></li>
          </ul>
        </div>

        {/* Trust column */}
        <div className="footer__col">
          <div className="footer__col-title">Trust &amp; Safety</div>
          <ul className="footer__list">
            <li><ShieldCheckmark20Regular className="footer__icon" /><span>Secure authentication</span></li>
            <li><Person20Regular className="footer__icon" /><span>Friends-only transactions</span></li>
            <li><HeartPulse20Regular className="footer__icon" /><span>Admin-reviewed accounts</span></li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <span className="footer__copyright">
          &copy; {YEAR} Stuffie™ — Coded by{' '}
          <a
            href="http://stuffie.azurewebsites.net/PM_Carlos-Reyes2.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Carlos Reyes
          </a>
        </span>
        <span className="footer__version">v1.0</span>
      </div>
    </footer>
  );
};

export default Footer;

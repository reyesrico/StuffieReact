import React from 'react';
import './Footer.scss';

const YEAR = new Date().getFullYear();

const Footer = () => (
  <footer className="footer">
    <span className="footer__copy">
      &copy; {YEAR}{' '}
      <a
        href="http://stuffie.azurewebsites.net/PM_Carlos-Reyes2.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Stuffie™
      </a>
    </span>
    <nav className="footer__links" aria-label="Footer">
      <a href="mailto:support@stuffie.net">Contact</a>
      <a href="https://github.com/reyesrico" target="_blank" rel="noopener noreferrer">GitHub</a>
      <span>v1.0</span>
    </nav>
  </footer>
);

export default Footer;

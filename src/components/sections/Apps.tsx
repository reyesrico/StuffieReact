import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Apps.scss';

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px', verticalAlign: 'middle' }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Apps = (_props: any) => {
  const { t } = useTranslation();

  return (
    <div className="apps">
      <div className="apps__title">{t('apps.title')}</div>
      <div className="apps__item"><Link to='/tickets'>{t('apps.tickets')}</Link></div>
      <div className="apps__item">
        <a href='https://reyesrico.github.io/CovidCharts' target="_blank" rel="noopener noreferrer">
          {t('apps.covidCharts')}<ExternalIcon />
        </a>
      </div>
    </div>
  );
}

export default Apps;

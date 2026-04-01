import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Apps.scss';

const Apps = (_props: any) => {
  const { t } = useTranslation();

  return (
    <div className="apps">
      <div className="apps__title">{t('apps.title')}</div>
      <div className="apps__item"><Link to='/map'>{t('apps.map')}</Link></div>
      <div className="apps__item"><Link to='/tickets'>{t('apps.tickets')}</Link></div>
      <div className="apps__item"><Link to='/charts'>{t('apps.charts')}</Link></div>
      <div className="apps__item"><Link to='/spotify'>{t('apps.spotify')}</Link></div>
      <div className="apps__item"><a href='https://reyesrico.github.io/CovidCharts'>{t('apps.covidCharts')}</a></div>
      <div className="apps__item"><Link to='/cards'>{t('apps.cards')}</Link></div>
    </div>
  );
}

export default Apps;

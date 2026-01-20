import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Apps.scss';

const Apps = (props: any) => {
  const { t } = useTranslation();

  return (
    <div className="apps">
      <div className="apps__title">Apps &amp; extras</div>
      <div className="apps__item"><Link to='/map'>Map</Link></div>
      <div className="apps__item"><Link to='/tickets'>Tickets</Link></div>
      <div className="apps__item"><Link to='/support'>{t('Support')}</Link></div>
      <div className="apps__item"><Link to='/charts'>Charts</Link></div>
      <div className="apps__item"><Link to='/spotify'>Spotify</Link></div>
      <div className="apps__item"><Link to='/test'>Test</Link></div>
      <div className="apps__item"><a href='https://reyesrico.github.io/CovidCharts'>Covid Charts</a></div>
      <div className="apps__item"><Link to='/test2'>Test2</Link></div>
      <div className="apps__item"><Link to='/cards'>Cards</Link></div>
      <div className="apps__item"><Link to='/test4'>Test4</Link></div>
      <div className="apps__item"><Link to='/test5'>Test5</Link></div>
      <div className="apps__item"><Link to='/tetris'>Tetris</Link></div>
    </div>
  );
}

export default Apps;

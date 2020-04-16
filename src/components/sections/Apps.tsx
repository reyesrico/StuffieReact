import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { options } from '../../config/options';

import Menu from '../shared/Menu';
import State from '../../redux/State';
import { AppsProps } from './types';
import './Apps.scss';

class Apps extends Component<AppsProps, any> {
  state = {
    lang: options[0]
  };

  changeLang = (lang:any) => {
    const { i18n } = this.props;

    this.setState({ lang });
    i18n.changeLanguage(lang.value);
  };

  renderCurrentLanguage = (isOpen: boolean) => {
    const { t } = this.props;

    return (
      <div className={isOpen ? 'apps__language-open' : 'apps__language'}>
        {t('Language')}
      </div>
    );
  }

  render() {
    return (
      <div className="apps">
        <div className="apps__title">Apps &amp; extras</div>
        <div className="apps__item"><Link to='/tickets'>Tickets</Link></div>
        <div className="apps__item"><Link to='/support'>Support</Link></div>
        <div className="apps__item"><Link to='/charts'>Charts</Link></div>
        <div className="apps__item"><Link to='/test'>Test</Link></div>
        <hr />
        <div className="apps__item">
          <Menu label={(isOpen: boolean) => this.renderCurrentLanguage(isOpen)}>
            {options.map(option => {
              return (<div key={option.value} className="apps__option" onClick={() => this.changeLang(option)}>{option.label}</div>);
            })}
          </Menu>
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user
});

export default connect(mapStateToProps, {})(withTranslation()<any>(withRouter<any, React.ComponentClass<any>>(Apps)));

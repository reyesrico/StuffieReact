import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider, withTranslation } from 'react-i18next';

import i18n from './config/i18n';
import Routes from './components/main/Routes';
import './App.scss';

class App extends Component {
	render() {
		return (
			<I18nextProvider i18n={ i18n }>
				<BrowserRouter>
					<Routes />
				</BrowserRouter>
			</I18nextProvider>
		);
	}
}


export default withTranslation()<any>(App);

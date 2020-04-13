import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider, withTranslation } from 'react-i18next';
import { Provider } from 'react-redux';

import i18n from './config/i18n';
import Routes from './components/main/Routes';
import './App.scss';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

class App extends Component<any, any>{
	render() {
		const { store } = this.props;

		return (
			<div className="stuffie__app">
				<Provider store={store}>
					<I18nextProvider i18n={ i18n }>
						<BrowserRouter>
							<Routes />
						</BrowserRouter>
					</I18nextProvider>
				</Provider>
			</div>
		);
	}
}


export default withTranslation()<any>(App);

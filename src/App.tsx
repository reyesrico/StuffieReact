import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import i18n from './config/i18n';
import TopRoutes from './components/main/TopRoutes';
import { UserProvider } from './components/context/UserContext';

import './App.scss';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

// https://developer.microsoft.com/en-us/fluentui#/styles/web/icons
import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();

const App = (props: any) => {
	const { store } = props;
	return (
		<div className="stuffie__app">
			<Provider store={store}>
				<I18nextProvider i18n={i18n}>
					<UserProvider>
						<BrowserRouter>
							<TopRoutes />
						</BrowserRouter>
					</UserProvider>
				</I18nextProvider>
			</Provider>
		</div>
	);
}

export default App;

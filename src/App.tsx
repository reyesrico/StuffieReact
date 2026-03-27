import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';

import i18n from './config/i18n';
import TopRoutes from './components/main/TopRoutes';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { QueryProvider } from './context/QueryProvider';

import './App.scss';

// https://developer.microsoft.com/en-us/fluentui#/styles/web/icons
import { initializeIcons } from '@fluentui/font-icons-mdl2';

initializeIcons();

// Inner component that can use ThemeContext
const AppContent = () => {
	const { theme } = useTheme();
	const fluentTheme = theme === 'dark' ? webDarkTheme : webLightTheme;
	// Use basename only for production (GitHub Pages)
	const basename = import.meta.env.MODE === 'production' ? '/StuffieReact' : '/';

	return (
		<FluentProvider theme={fluentTheme}>
			<BrowserRouter basename={basename}>
				<TopRoutes />
			</BrowserRouter>
		</FluentProvider>
	);
};

const App = () => {
	return (
		<div className="stuffie__app">
			<I18nextProvider i18n={i18n}>
				<QueryProvider>
					<UserProvider>
						<ThemeProvider>
							<AppContent />
						</ThemeProvider>
					</UserProvider>
				</QueryProvider>
			</I18nextProvider>
		</div>
	);
}

export default App;

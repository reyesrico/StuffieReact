import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import i18n from './config/i18n';
import TopRoutes from './components/main/TopRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

import './App.scss';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

// https://developer.microsoft.com/en-us/fluentui#/styles/web/icons
import { initializeIcons } from '@fluentui/font-icons-mdl2';

// Create a client
const queryClient = new QueryClient();

initializeIcons();

const App = (props: any) => {
	const { store } = props;
	return (
		<div className="stuffie__app">
			<Provider store={store}>
				<I18nextProvider i18n={i18n}>
					<UserProvider>
						<ThemeProvider>
							<QueryClientProvider client={queryClient}>
							{/* <FluentProvider> { /* theme={theme === "light" ? webLightTheme : webDarkTheme}> */ }
								<BrowserRouter>
									<TopRoutes />
								</BrowserRouter>
							{/* </FluentProvider> */}
							</QueryClientProvider>
						</ThemeProvider>
					</UserProvider>
				</I18nextProvider>
			</Provider>
		</div>
	);
}

export default App;

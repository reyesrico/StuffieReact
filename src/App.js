import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Routes from './components/main/Routes';
import './App.css';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<Routes />
			</BrowserRouter>
		);
	}
}

export default App;

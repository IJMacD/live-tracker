import React, { Component } from 'react';

import SmearValue from './SmearValue';
import Graph from './Graph';
import AlphaVantage from './AlphaVantage';

import './App.css';

const AV_API_KEY = "AAKDZB35OJ9KVSWP";
const stock = "TSLA";
const store = AlphaVantage(AV_API_KEY, stock);

class App extends Component {

	componentDidMount () {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const usdFormat = new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" });
		const gbpFormat = new Intl.NumberFormat('en-GB', { style: "currency", currency: "GBP" });
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">{stock}</h1>
				</header>
				<div className="App-container">
					<Graph values={store.state.values} />
					<div className="App-info">
						{ store.state.value &&
							<p>{store.state.value.toFixed(3)}</p>
						}
						{ store.state.value &&
							<SmearValue value={store.state.value*49} format={usdFormat} />
						}
						{ store.state.value && store.state.exchangeRate &&
							<SmearValue value={store.state.value*49*store.state.exchangeRate} format={gbpFormat} />
						}
						{ store.state.updated &&
							<p>{store.state.updated.toString().substr(0, 24)}</p>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default App;

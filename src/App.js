import React, { Component } from 'react';

import SmearValue from './SmearValue';
import Graph from './Graph';
import AlphaVantage from './AlphaVantage';

import './App.css';

const AV_API_KEY = "AAKDZB35OJ9KVSWP";
const stock = "TSLA";
const store = AlphaVantage(AV_API_KEY, stock);

class App extends Component {
	constructor () {
		super();

		this.state = {
			shares: 0,
		};

		this.handleShareChange = this.handleShareChange.bind(this);
	}

	handleShareChange (e) {
		this.setState({ shares: e.target.value });
	}

	componentDidMount () {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const usdFormatter = new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" });
		const gbpFormatter = new Intl.NumberFormat('en-GB', { style: "currency", currency: "GBP" });

		const { shares } = this.state;

		const state = store.getState();

		const delta = !!state.values.length && (state.values[0] - state.values[1]);

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">{stock}</h1>
					<label>
						Shares: 
						<input type="number" value={shares} min={0} onChange={this.handleShareChange} />
					</label>
				</header>
				<div className="App-container">
					<Graph values={state.values} />
					<div className="App-info">
						{ state.value &&
							<p>{state.value.toFixed(3)}</p>
						}
						{ state.value && this.state.shares > 0 &&
							<div>
								<SmearValue value={state.value*shares} formatter={usdFormatter} />
								{ delta &&
									<p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*shares).toFixed(3)} $/min</p>
								}
							</div>
						}
						{ state.value && this.state.shares > 0 && state.exchangeRate &&
							<div>
								<SmearValue value={state.value*shares*state.exchangeRate} formatter={gbpFormatter} />
								{ delta && state.exchangeRate &&
									<p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*shares*state.exchangeRate).toFixed(3)} £/min</p>
								}
							</div>
						}
						{ state.updated &&
							<SmearValue value={state.updated} formatter={dateFormatter} />
						}
					</div>
				</div>
			</div>
		);
	}
}

export default App;

const dateFormatter = {
	format (time) {
		return (new Date(time)).toString().substr(0, 24);
	}
};
import React, { Component } from 'react';

import * as AlphaVantage from './AlphaVantage';

import './App.css';
import { TimeDelayStockDisplay } from './TimeDelayStockDisplay';

const AV_API_KEY = "AAKDZB35OJ9KVSWP";
const stock = "TSLA";
// const stockStore = AlphaVantage.stock(AV_API_KEY, stock);
const fexStore = AlphaVantage.fex(AV_API_KEY, "gbp", "hkd");
const STORAGE_KEY = "LT_STATE";

class App extends Component {
	constructor (props) {
		super(props);

		const savedState = getSavedState();

		this.state = Object.assign({
			shareCount: 0,
			granularity: "1min",
		}, savedState);

		// stockStore.setGranularity(this.state.granularity);

		this.handleShareChange = this.handleShareChange.bind(this);
	}

	handleShareChange (e) {
		const newState = { shareCount: e.target.value };
		this.setState(newState);
		setSavedState(newState);
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevState.granularity !== this.state.granularity) {
			// stockStore.setGranularity(this.state.granularity);
			setSavedState({ granularity: this.state.granularity });
		}
	}

	componentDidMount () {
		// stockStore.subscribe(() => this.forceUpdate());
		fexStore.subscribe(() => this.forceUpdate());
	}

	render() {
		const granularity = this.state.granularity;

		// const stockState = stockStore.getState();

		const fexState = fexStore.getState();

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">
						{stock}
						<input
							type="number"
							value={this.state.shareCount}
							min="0"
							onChange={this.handleShareChange}
							style={{
								marginLeft: 10,
								width: 100,
								fontSize: 18,
							}}
						/>
					</h1>
					<button onClick={() => this.setState({ granularity: "1min" })} disabled={granularity === "1min"}>1 min</button>
					<button onClick={() => this.setState({ granularity: "5min" })} disabled={granularity === "5min"}>5 min</button>
					<button onClick={() => this.setState({ granularity: "15min" })} disabled={granularity === "15min"}>15 min</button>
					<button onClick={() => this.setState({ granularity: "30min" })} disabled={granularity === "30min"}>30 min</button>
					<button onClick={() => this.setState({ granularity: "60min" })} disabled={granularity === "60min"}>60 min</button>
				</header>
				<TimeDelayStockDisplay stock={fexState} volume={55000} granularity={granularity} />
				{/* <StockDisplay stock={stockState} volume={this.state.shareCount} granularity={granularity} /> */}
			</div>
		);
	}
}

export default App;

function getSavedState() {
	return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function setSavedState (newState) {
	const state = getSavedState();
	Object.assign(state, newState);

	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

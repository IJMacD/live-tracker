import React, { Component } from 'react';

import SmearValue from './SmearValue';
import Graph from './Graph';
import AlphaVantage from './AlphaVantage';

import './App.css';

const AV_API_KEY = "AAKDZB35OJ9KVSWP";
const stock = "TSLA";
const store = AlphaVantage(AV_API_KEY, stock);
const STORAGE_KEY = "LT_STATE";

class App extends Component {
	constructor (props) {
		super(props);

		const savedState = getSavedState();

		this.state = Object.assign({
			shareCount: 0,
			granularity: "1min",
		}, savedState);

		store.setGranularity(this.state.granularity);

		this.handleShareChange = this.handleShareChange.bind(this);
	}

	handleShareChange (e) {
		const newState = { shareCount: e.target.value };
		this.setState(newState);
		setSavedState(newState);
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevState.granularity !== this.state.granularity) {
			store.setGranularity(this.state.granularity);
			setSavedState({ granularity: this.state.granularity });
		}
	}

	componentDidMount () {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const usdFormatter = new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" });
		const gbpFormatter = new Intl.NumberFormat('en-GB', { style: "currency", currency: "GBP" });

		const shares = this.state.shareCount;
		const granularity = this.state.granularity;

		const state = store.getState();

		const delta = !!state.values.length && (state.values[0] - state.values[1]);

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
				<div className="App-container">
					{ state.error &&
						<h1 style={{ color: "red", position: "absolute", width: "100%" }}>{state.error}</h1>
					}
					{ state.values && state.values.length > 0 ?
						<div>
							<Graph values={state.values} granularity={granularity} updated={state.updated} />
							<div className="App-info">
								{ state.value > 0 &&
									<p style={{ fontSize: 36 }}>{state.value.toFixed(3)}</p>
								}
								{ state.value > 0 && shares > 0 &&
									<div>
										<SmearValue value={state.value*shares} formatter={usdFormatter} />
										{ delta !== 0 &&
											<p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*shares).toFixed(3)} $/{granularity}</p>
										}
									</div>
								}
								{ state.value > 0 && shares > 0 && state.exchangeRate &&
									<div>
										<SmearValue value={state.value*shares*state.exchangeRate} formatter={gbpFormatter} />
										{ delta !== 0 && state.exchangeRate &&
											<p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*shares*state.exchangeRate).toFixed(3)} £/{granularity}</p>
										}
									</div>
								}
								{ state.updated &&
									<SmearValue value={state.updated.valueOf()} formatter={dateFormatter} />
								}
							</div>
						</div>
					:
						!state.error && <p>Loading</p>
					}
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

function getSavedState() {
	return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function setSavedState (newState) {
	const state = getSavedState();
	Object.assign(state, newState);

	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

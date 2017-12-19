import React, { Component } from 'react';

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
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">{stock}</h1>
				</header>
				<div className="App-container">
					<Graph values={store.state.values} />
					<div className="App-info">
						{ store.state.value && 
							<p>{store.state.value}</p>
						}
						{ store.state.value && 
							<p>${(store.state.value*49).toFixed(2)}</p>
						}
						{ store.state.value && store.state.exchangeRate &&
							<p>£{(store.state.value*49*store.state.exchangeRate).toFixed(2)}</p>
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

const graph_width = 1000;
const graph_height = 500;
class Graph extends Component {
	doImperitiveStuff () {
		if (this.canvas && this.props.values && this.props.values.length) {
			
			const values = this.props.values;
			const v0 = values[0];
			const xScale = graph_width / this.props.values.length;
			const yScale = 20;
			const yOffset = graph_height / 2;
			
			const ctx = this.canvas.getContext("2d");
			
			ctx.clearRect(0,0,graph_width,graph_height);
			
			ctx.strokeStyle = "#999";
			
			ctx.beginPath();
			ctx.moveTo(0, yOffset);
			ctx.lineTo(graph_width, yOffset);
			ctx.stroke();
			
			ctx.strokeStyle = "#000";
			
			ctx.beginPath();
			
			let first = true;
			this.props.values.forEach((v, i) => {
				const x = i * xScale;
				const y = (v - v0) * yScale + yOffset;
				if (v && first) {
					ctx.moveTo(x, y);
					first = false;
				} else if (v) {
					ctx.lineTo(x, y);
				}				
			});
			
			ctx.stroke();
		}
	}
	
	componentDidMount () {
		this.doImperitiveStuff();
	}
	
	componentDidUpdate () {
		this.doImperitiveStuff();
	}
	
	render () {
		return <canvas ref={ref => this.canvas = ref} height={graph_height} width={graph_width} />
	}
}

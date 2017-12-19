import React, { Component } from 'react';

const graph_width = 1000;
const graph_height = 500;
export default class Graph extends Component {
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
				const x = graph_width - (i * xScale);
				const y = -(v - v0) * yScale + yOffset;
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
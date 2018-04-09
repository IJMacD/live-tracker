import React, { Component } from 'react';

const graph_width = 1000;
const graph_height = 500;

/**
 * @augments Component<{ values: number[], granularity: string, updated: Date }>
 */
export default class Graph extends Component {
	doImperitiveStuff () {
		const ctx = this.canvas.getContext("2d");

		ctx.clearRect(0,0,graph_width,graph_height);

		const values = this.props.values;

		if (this.canvas && values && values.length) {

			// Set up paramaters
			const v0 = values[0];
			const vmin = Math.min(...values);
			const vmax = Math.max(...values);
			const vrange = vmax - vmin;
			const xScale = graph_width / values.length;
			const yScale = (graph_height / vrange) * 0.9;
			const yOffset = graph_height * 0.95 - (v0 - vmin) * yScale;
			const ymin = -(vmin - v0) * yScale + yOffset;
			const ymax = -(vmax - v0) * yScale + yOffset;
			/** @type {number} Duration in ms */
			const totalDuration = parseInt(this.props.granularity, 10) * values.length * 60 * 1000;
			const up = this.props.updated;

			ctx.strokeStyle = "#999";
			ctx.fillStyle = "#999";

			ctx.beginPath();

			/****************
			 * Key Lines
			 ****************/

			// Current Value
			ctx.moveTo(0, yOffset);
			ctx.lineTo(graph_width, yOffset);
			ctx.fillText(v0, 0, yOffset - 2);
			ctx.stroke();

			// Minimum Value
			ctx.fillText(vmin, 0, ymin - 2);
			ctx.beginPath();
			ctx.strokeStyle = "#944";
			// H Line
			ctx.moveTo(0, ymin);
			ctx.lineTo(graph_width, ymin);
			// V Line
			const vmin_f = values.indexOf(vmin) / values.length;
			const vmin_x = graph_width * (1 - vmin_f);
			ctx.moveTo(vmin_x, 0);
			ctx.lineTo(vmin_x, graph_height);
			// Min time
			const diff_min = totalDuration * vmin_f;
			const d_min = new Date(up.valueOf() - diff_min);
			ctx.fillText(formatTime(d_min), graph_width * (1 - vmin_f) - 26, yOffset - 2);
			ctx.stroke();

			// Maximum Value
			ctx.fillText(vmax, 0, ymax - 2);
			ctx.beginPath();
			ctx.strokeStyle = "#494";
			// H Line
			ctx.moveTo(0, ymax);
			ctx.lineTo(graph_width, ymax);
			// V Line
			const vmax_f = values.indexOf(vmax) / values.length;
			const vmax_x = graph_width * (1 - vmax_f);
			ctx.moveTo(vmax_x, 0);
			ctx.lineTo(vmax_x, graph_height);
			// Max time
			const diff_max = totalDuration * vmax_f;
			const d_max = new Date(up.valueOf() - diff_max);
			ctx.fillText(formatTime(d_max), graph_width * (1 - vmax_f) - 26, yOffset - 2);
			ctx.stroke();

			/**************
			 * Times of Day
			 **************/
			// Latest Update Time
			ctx.fillText(formatTime(up), graph_width - 26, graph_height - 2);

			// Equal time divisions
			const div = 5;
			for (let i = 1; i < div; i++) {
				const diff1 = totalDuration * (i / div);
				const d1 = new Date(up.valueOf() - diff1);
				ctx.fillText(formatTime(d1), graph_width * (1 - i / div) - 26, graph_height - 2);
			}

			// Midnights
			ctx.beginPath();
			ctx.strokeStyle = "#449";

			const days = totalDuration / (24 * 60 * 60 * 1000);
			const l = days + 1;
			let i = 0;
			do {
				const t0 = new Date(+up - (totalDuration * (i / l)));
				const t1 = new Date(+up - (totalDuration * ((i + 1) / l)));
				if (t0.getDate() !== t1.getDate()){
					const midnight = new Date(t0);
					midnight.setHours(0, 0, 0, 0);
					// V Line
					const midnight_f = (+up - +midnight) / totalDuration;
					const midnight_x = graph_width * (1 - midnight_f);
					ctx.moveTo(midnight_x, 0);
					ctx.lineTo(midnight_x, graph_height);
				}

				i++;
			} while (i < l);

			ctx.stroke();


			/********************
			 * Plot actual graph
			 ********************/
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

/**
 *
 * @param {Date} date
 */
function formatTime (date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 *
 * @param {number} n
 * @return {string}
 */
function pad (n) {
	return n < 10 ? `0${n}` : n.toString();
}

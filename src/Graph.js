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


			/****************
			 * Key Lines
			 ****************/

			// Current Value
			ctx.beginPath();
			ctx.strokeStyle = "#333";
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
			ctx.fillText(formatTime(d_min), graph_width * (1 - vmin_f) - 28, graph_height - 2);
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
			ctx.fillText(formatTime(d_max), graph_width * (1 - vmax_f) - 28, graph_height - 2);
			ctx.stroke();


			/*********************
			 * Cent Lines
			 *********************/
			ctx.beginPath();
			ctx.strokeStyle = "#ccc";

			const pixelsPerCent = yScale;
			const startCentFrac = vmin - Math.floor(vmin);
			const startCentOffset = startCentFrac * pixelsPerCent;

			let p = Math.floor(vmin);

			for(let y = ymin + startCentOffset; y > 0; y -= pixelsPerCent) {
				ctx.moveTo(0, y);
				ctx.lineTo(graph_width, y);
				ctx.fillText(p++, graph_width - 16, y-2);
			}

			ctx.stroke();


			/**************
			 * Times of Day
			 **************/
			// Latest Update Time
			ctx.fillText(formatTime(up), graph_width - 26, graph_height - 2);

			// Midnights
			ctx.beginPath();
			ctx.strokeStyle = "#333";

			const numDays = totalDuration / (24 * 60 * 60 * 1000);
			const pixelsPerDay = graph_width / numDays;
			const startDayFrac = (up.getHours() + (up.getMinutes() + (up.getSeconds() / 60)) / 60) / 24;
			const startDayOffset = startDayFrac * pixelsPerDay;

			for(let x = graph_width - startDayOffset; x > 0; x -= pixelsPerDay) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, graph_height);
			}

			ctx.stroke();

			// Hours
			ctx.beginPath();
			ctx.strokeStyle = "#ccc";

			const numHours = totalDuration / (60 * 60 * 1000);
			const pixelsPerHour = graph_width / numHours;
			const startHourFrac = (up.getMinutes() + (up.getSeconds() / 60)) / 60;
			const startHourOffset = startHourFrac * pixelsPerHour;

			let h = up.getHours();

			for(let x = graph_width - startHourOffset; x > 0; x -= pixelsPerHour) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, graph_height);
				ctx.fillText(`${pad(h)}:00`, x - 26, graph_height - 2);
				h = (h + 24 - 1) % 24;
			}

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

import React, { Component } from 'react';

const step = 100;

export default class SmearValue extends Component {
	constructor (props) {
		super(props);

		this.state = {
			value: props.value,
			delta: 0,
			time: 0,
		};
	}

	loop () {
		this.setState(({ value, delta, time }) => {
			value += delta;
			time -= step;

			if (time > 0) {
				setTimeout(() => this.loop(), step);

				return {
					value,
					time,
				};
			}

			return {
				value: this.props.value,
			};
		});

	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.value !== this.props.value) {
			const time = 60 * 1000;
			const delta = (nextProps.value - this.state.value) / (time / step);
			this.setState({ time, delta });

			this.loop();
		}
	}

	render () {
		if (this.props.format) {
			return <p>{this.props.format.format(this.state.value)}</p>
		}

		return <p>{this.state.value}</p>
	}
}
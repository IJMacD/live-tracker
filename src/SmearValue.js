import React, { Component } from 'react';

const step = 100;

export default class SmearValue extends Component {
	constructor (props) {
		super(props);

		this.state = {
			value: props.value.valueOf(),
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
				value: this.props.value.valueOf(),
			};
		});

	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.value !== this.props.value.valueOf()) {
			const time = 60 * 1000;
			const delta = (nextProps.value.valueOf() - this.state.value) / (time / step);
			this.setState({ time, delta });

			this.loop();
		}
	}

	render () {
		if (this.props.formatter) {
			return <p>{this.props.formatter.format(this.state.value)}</p>
		}

		return <p>{this.state.value}</p>
	}
}
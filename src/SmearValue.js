import React, { Component } from 'react';

const step = 100;

/**
 * @augments Component<{ value: number, formatter: { format: (number) => string }}, { value: number, delta: number, time: number }>
 */
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
			const nextVal =  nextProps.value.valueOf();
			const diff = nextVal - this.state.value;

			if (diff / nextVal > 0.1) {
				this.setState({ value: nextVal });
			}
			else {
				const time = 60 * 1000;
				const delta = diff / (time / step);
				this.setState({ time, delta });

				this.loop();
			}
		}
	}

	render () {
		if (this.props.formatter) {
			return <p>{this.props.formatter.format(this.state.value)}</p>
		}

		return <p>{this.state.value}</p>
	}
}

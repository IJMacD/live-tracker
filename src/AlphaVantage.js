import moment from 'moment-timezone';

function common (loop, { granularity } = {}) {
	/** @type { (() => void)[] } */
	let subscribers = [];
	let isAlive = false;
	/** @type {number|false} */
	let timeout = false;

	/** @type {{ value: number, values: number[], exchangeRate: number, updated: Date, error: string }} */
	let state = {
		value: 0,
		values: [],
		updated: null,
		error: null,
	};

	function checkIsAlive () {
		if (subscribers.length) {
			isAlive = true;

			if (!timeout) {
				run();
				timeout = setInterval(run, 60 * 1000);
			}
		} else {
			isAlive = false;

			if (timeout) {
				clearInterval(timeout);
			}
		}
	}

	async function run () {
		const newState = await loop();

		state = { ...state, ...newState };

		notifyAll();
	}

	function notifyAll () {
		subscribers.forEach(s => s());
	}

	const store = {
		getState: () => state,

		/** @param {() => void} callback */
		subscribe (callback) {
			subscribers.push(callback);

			checkIsAlive();
		},

		/** @param {() => void} callback */
		unsubscribe (callback) {
			subscribers = subscribers.filter(s => s !== callback);
		},

		/** @param {string} g */
		setGranularity (g) {
			granularity = g;

			state.values.length = 0;
			state.error = null;
			notifyAll();

			if (timeout) {
				clearInterval(timeout);
				timeout = false;
			}

			checkIsAlive();
		}
	};

	return store;
}

/**
 *
 * @param {string} date
 * @param {string} timezone
 * @return {Date}
 */
function parseDate (date, timezone) {
	return moment.tz(date.replace(' ', 'T'), timezone).toDate();
}

export function stock (API_KEY, stock) {
	const context = {
		granularity: "1min",
	};

	function loop () {

		return fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=${context.granularity}&apikey=${API_KEY}`)
			.then(d => d.json())
			.then(data => {
				if(data["Error Message"]) {
					return { error: data["Error Message"] };
				}

				if(data["Information"]) {
					return { error: data["Information"] };
				}

				if (!data["Meta Data"]) {
					return { error: "Missing Meta Data" };
				}

				const interval = data["Meta Data"]["4. Interval"];

				if (interval !== context.granularity) {
					// Fetch is stale, drop
					return {};
				}

				const key = `Time Series (${interval})`;

				if (!data[key]) {
					return { error: "Missing Time Series Data" };
				}

				const state = {
					error: null,
					values: Object.values(data[key]).map(d => parseFloat(d["4. close"])),
					updated: parseDate(Object.keys(data[key])[0], data["Meta Data"]["6. Time Zone"]),
				};

				state.value = state.values[0]; // 0th value is most recent

				return state;
			});
	}

	return common(loop, context);
}

export function fexInstant (API_KEY, from_currency, to_currency) {

	function loop () {
		return fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from_currency}&to_currency=${to_currency}&apikey=${API_KEY}`)
			.then(r => r.json())
			.then(data => {
				if(!data["Realtime Currency Exchange Rate"]) {
					return;
				}

				return { value: data["Realtime Currency Exchange Rate"]["5. Exchange Rate"] };
			});
	}

	return common(loop)
}

export function fex (API_KEY, from_currency, to_currency) {
	const context = {
		granularity: "1min",
	};

	function loop () {
		return fetch(`https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from_currency}&to_symbol=${to_currency}&interval=${context.granularity}&apikey=${API_KEY}`)
			.then(r => r.json())
			.then(data => {
				if(data["Error Message"]) {
					return { error: data["Error Message"] };
				}

				if(data["Information"]) {
					return { error: data["Information"] };
				}

				if (!data["Meta Data"]) {
					return { error: "Missing Meta Data" };
				}

				const interval = data["Meta Data"]["5. Interval"];

				if (interval !== context.granularity) {
					// Fetch is stale, drop
					return {};
				}

				const key = `Time Series FX (${interval})`;

				if (!data[key]) {
					return { error: "Missing Time Series Data" };
				}

				const state = {
					error: null,
					values: Object.values(data[key]).map(d => parseFloat(d["4. close"])),
					updated: parseDate(Object.keys(data[key])[0], data["Meta Data"]["7. Time Zone"]),
				};

				state.value = state.values[0]; // 0th value is most recent

				return state;
			});
	}

	return common(loop, context)
}
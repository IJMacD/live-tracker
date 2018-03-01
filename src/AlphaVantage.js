export default function (API_KEY, stock) {
	/** @type { (() => void)[] } */
	let subscribers = [];
	let isAlive = false;
	/** @type {number|false} */
	let timeout = false;
	/** @type {number|false} */
	let exchangeTimeout = false;
	let granularity = "1min";

	/** @type {{ value: number, values: number[], exchangeRate: number, updated: Date, error: string }} */
	let state = {
		value: 0,
		values: [],
		exchangeRate: 1,
		updated: null,
		error: null,
	};

	function checkIsAlive () {
		if (subscribers.length) {
			isAlive = true;

			if (!timeout) {
				loop();
				timeout = setInterval(loop, 60 * 1000);
			}

			loadExchangeRate();
		} else {
			isAlive = false;

			if (timeout) {
				clearInterval(timeout);
			}
		}
	}

	function loop () {

		fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=${granularity}&apikey=${API_KEY}`)
		.then(d => d.json())
		.then(data => {
			if(data["Error Message"]) {
				state.error = data["Error Message"];
				notifyAll()
				return
			}

			if(data["Information"]) {
				state.error = data["Information"];
				notifyAll()
				return
			}

			if (!data["Meta Data"]) {
				state.error = "Missing Meta Data";
				notifyAll()
				return;
			}

			const interval = data["Meta Data"]["4. Interval"];
			const key = `Time Series (${interval})`;

			if (!data[key]) {
				state.error = "Missing Time Series Data";
				return;
			}

			state.error = null;

			state.values = Object.values(data[key]).map(d => parseFloat(d["4. close"]));
			state.value = state.values[0]; // 0th value is most recent
			state.updated = new Date(Object.keys(data[key])[0]);

			notifyAll();

		});
	}

	function loadExchangeRate () {

		fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=GBP&apikey=${API_KEY}`)
		.then(r => { exchangeTimeout = false; return r; })
		.then(r => r.json())
		.then(data => {
			if(!data["Realtime Currency Exchange Rate"]) {
				return;
			}

			state.exchangeRate = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
			notifyAll();

			if (isAlive && !exchangeTimeout) {
				exchangeTimeout = setTimeout(() => loadExchangeRate(), 10 * 60 * 1000); // reload exchange rate every 10 minutes
			}
		}, () => exchangeTimeout = setTimeout(() => loadExchangeRate(), 10 * 1000)); // catch: retry in 10 seconds
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

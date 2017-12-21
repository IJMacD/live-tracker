export default function (API_KEY, stock) {
	let subscribers = [];
	let isAlive = false;
	let timeout = false;
	let exchangeTimeout = false;
	let state = {
		values: [],
	};

	function checkIsAlive () {
		if (!isAlive && subscribers.length) {
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
		
		fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=1min&apikey=${API_KEY}`)
		.then(d => d.json())
		.then(data => { 
			if (!data["Time Series (1min)"]) {
				return;
			}
			
			state.values = Object.values(data["Time Series (1min)"]).map(d => parseFloat(d["4. close"], 10));
			state.value = state.values[0]; // 0th value is most recent
			state.updated = new Date(Object.keys(data["Time Series (1min)"])[0]);
		
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
		
		subscribe (callback) {
			subscribers.push(callback);
			
			checkIsAlive();
		},
		
		unsubscribe (callback) {
			subscribers = subscribers.filter(s => s !== callback);
		}
	};
	
	return store;
}
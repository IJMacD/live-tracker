export default function (API_KEY, stock) {
	let subscribers = [];
	let isAlive = false;
	let timeout = false;
	let exchangeTimeout = false;

	function checkIsAlive () {
		if (!isAlive && subscribers.length) {
			isAlive = true;
			
			loop();
			loadExchangeRate();
		} else {
			isAlive = false;
		}
	}

	function loop () {
		
		fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=1min&apikey=${API_KEY}`)
		.then(d => { timeout = false; return d; })
		.then(d => d.json())
		.then(data => { 
			if (!data["Time Series (1min)"]) {
				return;
			}
			
			store.state.values = Object.values(data["Time Series (1min)"]).map(d => parseFloat(d["4. close"], 10));
			store.state.value = store.state.values[0]; // 0th value is most recent
			store.state.updated = new Date(Object.keys(data["Time Series (1min)"])[0]);
		
			notifyAll();
			
			if (isAlive && !timeout) {
				timeout = setTimeout(loop, 60 * 1000);
			}
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
			
			store.state.exchangeRate = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
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
		state: {
			values: [],
		},
		
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
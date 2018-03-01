let subscribers = [];
let isAlive = false;

let state = {
	value: 0,
};

function checkIsAlive () {
	if (!isAlive && subscribers.length) {
		isAlive = true;

		loop();
	} else {
		isAlive = false;
	}
}

function loop () {
	if (typeof state.value === "undefined") {
		state.value = randBetween(500, 1500);
	}

	const delta = randBetween(-100, 100);

	state.value += delta;

	notifyAll();

	if (isAlive) {
		setTimeout(loop, randBetween(1000, 5000));
	}
}

function notifyAll () {
	subscribers.forEach(s => s());
}

/**
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randBetween(min, max) {
	return (max - min) * Math.random() + min;
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

export default store;

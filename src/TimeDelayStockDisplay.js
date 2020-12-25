import React, { useState, useEffect } from 'react';
import Graph from './Graph';

/**
 * @typedef Stock
 * @prop {Date} updated
 * @prop {number[]} values
 * @prop {number} value
 * @prop {number} delta
 * @prop {string} [error]
 */

 /**
  *
  * @param {object} param0
  * @param {Stock} param0.stock
  * @param {number} param0.volume
  * @param {string} param0.granularity
  */
export function TimeDelayStockDisplay ({ stock, volume, granularity }) {
    const timeDelay = 5 * 60 * 1000;
    const { values } = stock;
    const [ delayedNow, setDelayedNow ] = useState(Date.now() - timeDelay);

    useEffect(() => {
        const interval = setInterval(() => setDelayedNow(Date.now() - timeDelay), 100);

        return () => clearInterval(interval);
    }, [timeDelay]);

    const { value: pseudoValue, rate } = interpolateValue(stock, delayedNow);

    const usdFormatter = new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" });

    return (
        <div className="App-container">
            { stock.error &&
                <h1 style={{ color: "red", position: "absolute", width: "100%" }}>{stock.error}</h1>
            }
            { values && values.length > 0 ?
                <div>
                    <Graph values={values} granularity={granularity} updated={stock.updated} timeDelay={new Date(delayedNow)} value={pseudoValue} />
                    <div className="App-info">
                        { stock.value > 0 &&
                            <p style={{ fontSize: 36 }}>{pseudoValue.toFixed(3)}</p>
                        }
                        { pseudoValue > 0 && volume > 0 &&
                            <div>
                                <p>{usdFormatter.format(pseudoValue*volume)}</p>
                                { rate !== 0 &&
                                    <p style={{ color: rate > 0 ? "#3f3" : "#f33" }}>{(rate*volume).toFixed(3)} $/{granularity}</p>
                                }
                            </div>
                        }
                        { pseudoValue > 0 && volume > 0 && stock.exchangeRate &&
                            <div>
                                <p>{usdFormatter.format(pseudoValue*volume*stock.exchangeRate)}</p>
                                { rate !== 0 && stock.exchangeRate &&
                                    <p style={{ color: rate > 0 ? "#3f3" : "#f33" }}>{(rate*volume*stock.exchangeRate).toFixed(3)} £/{granularity}</p>
                                }
                            </div>
                        }
                        { stock.updated &&
                            <p>{dateFormatter.format(delayedNow)}</p>
                        }
                    </div>
                </div>
            :
                !stock.error && <p>Loading</p>
            }
        </div>
    );
}

const dateFormatter = {
	format (time) {
		return (new Date(time)).toString().substr(0, 24);
	}
};


/**
 * @param {Stock} stock
 * @param {number} time
 */
function interpolateValue (stock, time) {
    if (time > stock.updated) {
        return stock.value;
    }

    const delta = stock.updated - time;

    const step = Math.floor(delta / stock.delta);
    const t = (delta % stock.delta) / stock.delta;

    const v0 = stock.values[step];
    const v1 = stock.values[step + 1];

    const dv = v1 - v0;

    return {
        value: v0 + dv * t,
        rate: -dv,
    };
}
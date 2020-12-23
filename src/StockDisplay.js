import React from 'react';
import SmearValue from './SmearValue';
import Graph from './Graph';

export function StockDisplay ({ stock, volume, granularity }) {
    const usdFormatter = new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" });
    const gbpFormatter = new Intl.NumberFormat('en-GB', { style: "currency", currency: "GBP" });

    const delta = !!stock.values.length && (stock.values[0] - stock.values[1]);

    return (
        <div className="App-container">
            { stock.error &&
                <h1 style={{ color: "red", position: "absolute", width: "100%" }}>{stock.error}</h1>
            }
            { stock.values && stock.values.length > 0 ?
                <div>
                    <Graph values={stock.values} granularity={granularity} updated={stock.updated} />
                    <div className="App-info">
                        { stock.value > 0 &&
                            <p style={{ fontSize: 36 }}>{stock.value.toFixed(3)}</p>
                        }
                        { stock.value > 0 && volume > 0 &&
                            <div>
                                <SmearValue value={stock.value*volume} formatter={usdFormatter} />
                                { delta !== 0 &&
                                    <p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*volume).toFixed(3)} $/{granularity}</p>
                                }
                            </div>
                        }
                        { stock.value > 0 && volume > 0 && stock.exchangeRate &&
                            <div>
                                <SmearValue value={stock.value*volume*stock.exchangeRate} formatter={gbpFormatter} />
                                { delta !== 0 && stock.exchangeRate &&
                                    <p style={{ color: delta > 0 ? "#3f3" : "#f33" }}>{(delta*volume*stock.exchangeRate).toFixed(3)} £/{granularity}</p>
                                }
                            </div>
                        }
                        { stock.updated &&
                            <SmearValue value={stock.updated.valueOf()} formatter={dateFormatter} />
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

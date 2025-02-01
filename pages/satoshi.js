import { useState, useEffect } from 'react';
import Head from 'next/head';
import Menu from '../components/Menu';

export default function Satoshi() {
  const [price, setPrice] = useState(null);
  const [dollars, setDollars] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        setPrice(data.bpi.USD.rate_float);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Bitcoin price');
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const calculateSatoshis = (usd) => {
    if (!price) return 0;
    const btc = usd / price;
    return Math.round(btc * 100000000); // Convert to satoshis
  };

  return (
    <>
      <Head>
        <title>Satoshi Calculator - Bitcoin Transactions Visualizer</title>
        <meta name="description" content="Calculate USD to Satoshi conversion" />
      </Head>
      <Menu />
      <div className="container">
        <div className="calculator">
          <h1>Satoshi Calculator</h1>
          
          {loading ? (
            <p>Loading price data...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
              <div className="price-info">
                <span>1 BTC = ${price?.toLocaleString()} USD</span>
              </div>
              
              <div className="input-group">
                <input
                  type="number"
                  value={dollars}
                  onChange={(e) => setDollars(e.target.value)}
                  min="0"
                  step="1"
                />
                <label>USD</label>
              </div>

              <div className="result">
                <span className="equals">=</span>
                <span className="satoshis">{calculateSatoshis(dollars).toLocaleString()}</span>
                <span className="unit">satoshis</span>
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .container {
            padding-top: 100px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
          .calculator {
            background: rgba(255, 255, 255, 0.05);
            padding: 2rem;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            text-align: center;
          }
          h1 {
            color: #4CAF50;
            margin-bottom: 2rem;
            font-size: 1.8rem;
          }
          .price-info {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(76, 175, 80, 0.1);
            border-radius: 4px;
          }
          .input-group {
            margin: 2rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            padding: 0.8rem;
            border-radius: 4px;
            color: #fff;
            font-family: "Courier New", monospace;
            font-size: 1.2rem;
            width: 150px;
            text-align: center;
          }
          input:focus {
            outline: none;
            border-color: #4CAF50;
          }
          .result {
            margin-top: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          .equals {
            color: rgba(255, 255, 255, 0.5);
          }
          .satoshis {
            color: #4CAF50;
            font-size: 2rem;
            font-weight: bold;
          }
          .unit {
            color: rgba(255, 255, 255, 0.7);
          }
          .error {
            color: #ff4444;
          }
        `}</style>
      </div>
    </>
  );
} 
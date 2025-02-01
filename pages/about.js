import Head from 'next/head';
import Link from 'next/link';
import Menu from '../components/Menu';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Bitcoin Transactions Visualizer</title>
        <meta name="description" content="About the Bitcoin transactions visualization project" />
      </Head>
      <Menu />
      <div className="container">
        <h1>Bitcoin Transactions Visualizer</h1>
        <p className="author">by slashbin</p>
        
        <section>
          <h2>About</h2>
          <p>
            This visualization shows real-time Bitcoin transactions and blocks as they occur on the network.
            Each circle represents a transaction, with its size proportional to the amount of BTC transferred.
            Blocks appear as rotating squares with particle effects.
          </p>
        </section>

        <section>
          <h2>Features</h2>
          <ul>
            <li>Real-time transaction monitoring</li>
            <li>Visual representation of transaction values</li>
            <li>Block confirmations with particle effects</li>
            <li>Transaction rate monitoring</li>
            <li>Hover information for transactions and blocks</li>
            <li>Parallax effect following mouse movement</li>
          </ul>
        </section>

        <section>
          <h2>Technical Details</h2>
          <p>
            Built using Next.js and Canvas API. Data is streamed in real-time from the Blockchain.info WebSocket API.
            The visualization uses various techniques including particle systems, smooth animations, and audio feedback.
          </p>
        </section>
      </div>

      <style jsx>{`
      body {
          background: #1a1a1a;
      }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          color: #fff;
          font-family: "Courier New", monospace;
          min-height: 100vh;
        }
        
        .back {
          display: inline-block;
          margin-bottom: 2rem;
          color: #4CAF50;
          text-decoration: none;
        }
        
        .back:hover {
          text-decoration: underline;
        }
        
        h1 {
          color: #4CAF50;
          font-size: 1.8rem;
          margin: 0;
        }
        
        .author {
          color: rgba(76, 175, 80, 0.7);
          margin: 0.5rem 0 2rem;
        }
        
        h2 {
          color: #4CAF50;
          font-size: 1.4rem;
          margin-top: 2rem;
        }
        
        p, li {
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }
        
        ul {
          padding-left: 1.5rem;
        }
        
        li {
          margin: 0.5rem 0;
        }
        
        section {
          margin: 2rem 0;
        }
      `}</style>
    </>
  );
} 
import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Import BlockchainVis dynamically since it uses browser APIs
    import('../components/blockchain-vis').then(module => {
      new module.default();
    });
  }, []);

  return (
    <>
      <Head>
        <title>Bitcoin Transactions Visualizer</title>
        <meta name="description" content="Real-time visualization of Bitcoin blockchain transactions" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <canvas id="blockchainCanvas"></canvas>
      <style jsx global>{`
        body {
          margin: 0;
          overflow: hidden;
          background: #1a1a1a;
        }
        canvas {
          background: #1a1a1a;
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </>
  );
} 
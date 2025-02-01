import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Menu() {
  const router = useRouter();
  const isViz = router.pathname === '/viz';
  const isAbout = router.pathname === '/about';
  const isSatoshi = router.pathname === '/satoshi';

  return (
    <nav className="menu">
      <div className="menu-bar">
        <div className="menu-items">
          <Link href="/viz" className={`menu-item ${isViz ? 'active' : ''}`}>
            Visualization
          </Link>
          <Link href="/satoshi" className={`menu-item ${isSatoshi ? 'active' : ''}`}>
            Satoshi
          </Link>
          <Link href="/about" className={`menu-item ${isAbout ? 'active' : ''}`}>
            About
          </Link>
        </div>
      </div>

      <style jsx>{`
        .menu {
          width: 100%;
          z-index: 1000;
          padding: 20px;
          background: linear-gradient(to bottom, rgba(26, 26, 26, 1) 0%, rgba(26, 26, 26, 0.8) 60%, transparent);
        }
        .menu-bar {
          max-width: 800px;
          margin: 0 auto;
        }
        .menu-items {
          display: flex;
          gap: 20px;
          padding: 2px;
          border-radius: 6px;
          width: fit-content;
          color: rgba(76, 175, 80, 0.8);

        }
        .menu-item, .menu-item:visited {
          color: rgba(76, 175, 80, 0.8);
          text-decoration: none;
          font-family: "Courier New", monospace;
          font-size: 14px;
          padding: 8px 24px;
          transition: all 0.3s ease;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .menu-item:hover {
          color: rgba(76, 175, 80, 1);
          background: rgba(76, 175, 80, 0.15);
          transform: translateY(-1px);
        }
        .menu-item.active {
          color: #4CAF50;
          background: rgba(76, 175, 80, 0.2);
          box-shadow: 0 0 20px rgba(76, 175, 80, 0.1);
        }
      `}</style>
    </nav>
  );
} 
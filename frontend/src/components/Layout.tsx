import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a2e', 
      color: '#eee',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{ 
        background: '#16213e', 
        padding: '15px 20px',
        borderBottom: '1px solid #0f3460',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#e94560' }}>
          🔴 Red Team Platform
        </div>
        <ul style={{ 
          display: 'flex', 
          listStyle: 'none', 
          gap: '20px',
          margin: 0,
          padding: 0
        }}>
          <li>
            <Link to="/" style={{ 
              color: '#61dafb', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/targets" style={{ 
              color: '#61dafb', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}>
              Targets
            </Link>
          </li>
          <li>
            <Link to="/scans" style={{ 
              color: '#61dafb', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}>
              Scans
            </Link>
          </li>
          <li>
            <Link to="/vulnerabilities" style={{ 
              color: '#61dafb', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}>
              Vulnerabilities
            </Link>
          </li>
        </ul>
      </nav>
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

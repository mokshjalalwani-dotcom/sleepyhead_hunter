'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo" aria-label="SleepyHead Hunter home">
          <span className="navbar-logo-icon" aria-hidden="true">😴</span>
          <span>SleepyHead Hunter</span>
        </Link>

        <ul className="navbar-links" role="list">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><Link href="/configure">Configure</Link></li>
          <li>
            <Link
              href="/detect"
              id="nav-detect-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #007a99 0%, #005f77 100%)',
                color: '#ffffff',
                border: '1px solid rgba(0,229,255,0.5)',
                boxShadow: '0 0 16px rgba(0,229,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                textDecoration: 'none',
                letterSpacing: '0.3px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(0,229,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              👁️ Live Detector
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/mokshjalalwani-dotcom/sleepyhead_hunter"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              id="nav-github-btn"
            >
              ⭐ GitHub
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

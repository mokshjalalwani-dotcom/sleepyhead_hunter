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
            <a
              href="https://github.com"
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

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            <span aria-hidden="true">😴</span>
            <span>SleepyHead Hunter</span>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <Link href="/configure">Configure</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>

          <p className="footer-copy">
            Built with ❤️ &amp; caffeine · Open Source
          </p>
        </div>
      </div>
    </footer>
  );
}

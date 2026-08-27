import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';
import HowItWorks from '@/components/HowItWorks';
import FeaturesGrid from '@/components/FeaturesGrid';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <FeaturesGrid />

        {/* CTA Banner */}
        <section className="section" aria-labelledby="cta-title" style={{ paddingTop: '40px' }}>
          <div className="container">
            <div
              className="glass-card"
              style={{
                padding: '64px 48px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.06) 0%, rgba(255,140,0,0.04) 100%)',
                border: '1px solid rgba(0,229,255,0.2)',
              }}
            >
              <span className="section-label">// GET STARTED</span>
              <h2
                className="section-title"
                id="cta-title"
                style={{ margin: '0 auto 16px', maxWidth: '600px' }}
              >
                Configure Your Alarm Stages
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 40px', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Customize all 4 escalation stages — what gets shouted, how loud,
                and for how long. Export your settings as a ready-to-use Python config.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/configure" className="btn btn-primary" id="cta-configure-btn">
                  ⚙️ Open Configurator
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  id="cta-github-btn"
                >
                  📥 Download App
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Install Section */}
        <section className="section" aria-labelledby="install-title" style={{ paddingTop: '40px' }}>
          <div className="container">
            <span className="section-label">// INSTALLATION</span>
            <h2 className="section-title" id="install-title">Up and Running in 3 Commands</h2>
            <p className="section-sub">Tested on Python 3.9+. Works on Windows, macOS, and Linux.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
              {[
                { num: '1', cmd: 'git clone https://github.com/your-repo/sleepyhead-hunter', comment: '# Clone the repo' },
                { num: '2', cmd: 'pip install -r requirements.txt', comment: '# Install dependencies' },
                { num: '3', cmd: 'python eye_closure_alarm.py', comment: '# Launch the hunter' },
              ].map((item) => (
                <div
                  key={item.num}
                  className="glass-card"
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(0,229,255,0.1)',
                      border: '1px solid var(--border-bright)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontFamily: 'Space Mono, monospace',
                      color: 'var(--cyan)',
                      flexShrink: 0,
                    }}
                  >
                    {item.num}
                  </span>
                  <div style={{ flex: 1 }}>
                    <code
                      style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        display: 'block',
                      }}
                    >
                      {item.cmd}
                    </code>
                    <code
                      style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.comment}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

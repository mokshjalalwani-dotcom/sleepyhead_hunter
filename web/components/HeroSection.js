'use client';

import Link from 'next/link';
import AnimatedEye from './AnimatedEye';

export default function HeroSection() {
  return (
    <section className="hero section" id="hero" aria-label="Hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container">
        <div className="hero-inner">
          {/* Left: Text */}
          <div>
            <div className="hero-badge fade-in-up">
              <span className="hero-badge-dot" aria-hidden="true" />
              AI-POWERED · REAL-TIME
            </div>

            <h1 className="hero-title fade-in-up delay-1">
              <span className="hero-title-main">SleepyHead<br />Hunter</span>
              <span className="hero-title-sub">Drowsiness Detection Alarm</span>
            </h1>

            <p className="hero-desc fade-in-up delay-2">
              Falling asleep at your desk? SleepyHead Hunter watches your eyes
              using <span className="cyan-text">MediaPipe AI</span> and blasts an
              escalating <span className="amber-text">Hinglish voice alarm</span> the
              moment you doze off — getting louder until you wake up.
            </p>

            <div className="hero-ctas fade-in-up delay-3">
              <Link href="/configure" className="btn btn-primary" id="hero-configure-btn">
                ⚙️ Configure Alarm
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                id="hero-github-btn"
              >
                📦 View on GitHub
              </a>
            </div>

            {/* Tech Stack Pills */}
            <div className="fade-in-up delay-4" style={{ marginTop: '40px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Python 3', 'MediaPipe', 'OpenCV', 'edge-tts', 'pygame'].map(tech => (
                <span
                  key={tech}
                  style={{
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'Space Mono, monospace',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hero-visual fade-in-up delay-2">
            <div className="eye-container">
              <div className="eye-ring" aria-hidden="true" />
              <div className="eye-ring" aria-hidden="true" />
              <div className="eye-svg-wrap">
                <AnimatedEye size={220} />
              </div>
              {/* EAR Meter */}
              <EarMeter />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EarMeter() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: -20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(9, 21, 37, 0.9)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(12px)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>EAR</span>
      <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: '72%',
            background: 'linear-gradient(90deg, var(--green-ok), var(--cyan))',
            borderRadius: 2,
            animation: 'ear-pulse 2s ease-in-out infinite alternate',
          }}
        />
      </div>
      <span
        className="mono"
        style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-ok)' }}
        aria-label="EAR value"
      >
        0.312
      </span>
      <span
        style={{
          fontSize: '10px',
          padding: '2px 7px',
          background: 'rgba(0, 230, 118, 0.15)',
          borderRadius: '100px',
          color: 'var(--green-ok)',
          fontFamily: 'Space Mono, monospace',
        }}
      >
        AWAKE
      </span>
      <style>{`
        @keyframes ear-pulse {
          from { width: 68%; }
          to   { width: 76%; }
        }
      `}</style>
    </div>
  );
}

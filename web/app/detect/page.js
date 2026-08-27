'use client';

import dynamic from 'next/dynamic';

// Disable SSR — uses browser-only APIs (getUserMedia, Canvas, SpeechSynthesis, WebAssembly)
const LiveDetector = dynamic(() => import('@/components/LiveDetector'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: 'var(--text-secondary)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <span style={{ fontSize: '60px', animation: 'logo-blink 1.5s infinite' }}>👁️</span>
      <span>Loading AI model...</span>
      <style>{`
        @keyframes logo-blink {
          0%, 80%, 100% { opacity: 1; }
          90% { opacity: 0.1; }
        }
      `}</style>
    </div>
  ),
});

export default function DetectPage() {
  return <LiveDetector />;
}


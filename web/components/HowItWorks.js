export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '📷',
      title: 'Webcam Captures',
      desc: 'Your webcam feed is processed locally in real-time — nothing is uploaded to any server. Full privacy guaranteed.',
    },
    {
      number: '02',
      icon: '🧠',
      title: 'AI Detects Eyes',
      desc: 'MediaPipe Face Mesh maps 468 facial landmarks and computes your Eye Aspect Ratio (EAR) to measure eye openness.',
    },
    {
      number: '03',
      icon: '🚨',
      title: 'Alarm Fires',
      desc: 'If your eyes stay closed past the threshold, an escalating 4-stage Hinglish voice alarm blasts louder every few seconds.',
    },
  ];

  return (
    <section className="section" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <span className="section-label">// HOW IT WORKS</span>
        <h2 className="section-title" id="how-title">Simple, Effective, Relentless</h2>
        <p className="section-sub">
          Three steps from open eyes to a fully armed drowsiness guardian — all running
          locally on your machine.
        </p>

        <div className="how-steps">
          {steps.map((step) => (
            <div className="glass-card step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <div className="step-icon-wrap" aria-hidden="true">
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* EAR Formula Box */}
        <div
          className="glass-card"
          style={{ padding: '32px', marginTop: '40px', textAlign: 'center' }}
          role="region"
          aria-label="EAR formula"
        >
          <span className="section-label">// THE SCIENCE</span>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Eye Aspect Ratio Formula</h3>
          <div
            className="mono"
            style={{
              fontSize: '1.1rem',
              color: 'var(--cyan)',
              background: 'rgba(0, 229, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px 24px',
              display: 'inline-block',
              letterSpacing: '1px',
            }}
          >
            EAR = (‖P₂–P₆‖ + ‖P₃–P₅‖) / (2 × ‖P₁–P₄‖)
          </div>
          <p style={{ marginTop: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '16px auto 0' }}>
            When EAR drops below <span className="mono" style={{ color: 'var(--amber)' }}>0.21</span> for more than{' '}
            <span className="mono" style={{ color: 'var(--amber)' }}>4.0s</span>, the alarm fires.
          </p>
        </div>
      </div>
    </section>
  );
}

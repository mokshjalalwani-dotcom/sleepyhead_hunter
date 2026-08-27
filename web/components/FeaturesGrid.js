export default function FeaturesGrid() {
  const features = [
    {
      icon: '🧠',
      title: 'MediaPipe AI',
      desc: '468-point Face Mesh for highly accurate eye landmark detection — works with glasses, different lighting, and angles.',
    },
    {
      icon: '📈',
      title: 'Escalating Alarm',
      desc: '4 progressive stages that get louder and more urgent every 3 seconds. Stage 4 does not hold back.',
    },
    {
      icon: '🔄',
      title: 'Auto Re-arm',
      desc: 'No manual reset needed. The alarm automatically arms itself again the next time you open your eyes.',
    },
    {
      icon: '🗣️',
      title: 'Natural Voice',
      desc: 'Uses Microsoft Edge TTS with the hi-IN-SwaraNeural Indian voice for natural-sounding Hinglish alerts.',
    },
    {
      icon: '⚙️',
      title: 'Fully Configurable',
      desc: 'Tune EAR threshold, trigger delay, repeat interval, and all 4 stage messages with our web configurator.',
    },
    {
      icon: '🔒',
      title: '100% Local',
      desc: 'No cloud, no data uploads. Everything runs on your machine. Your face data never leaves your computer.',
    },
  ];

  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <span className="section-label">// FEATURES</span>
        <h2 className="section-title" id="features-title">Built to Actually Wake You Up</h2>
        <p className="section-sub">
          Not a gentle nudge. An increasingly aggressive AI-powered alarm system
          that escalates until you're wide awake.
        </p>

        <div className="features-grid">
          {features.map((f) => (
            <div className="glass-card feature-card" key={f.title}>
              <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

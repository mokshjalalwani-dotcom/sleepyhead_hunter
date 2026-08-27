export default function StatsBar() {
  const stats = [
    { icon: '🎯', value: '4', label: 'Escalation Stages' },
    { icon: '👁️', value: '468', label: 'Face Landmarks' },
    { icon: '⚡', value: '<100ms', label: 'Detection Latency' },
    { icon: '🔊', value: '∞', label: 'Will Not Stop' },
  ];

  return (
    <div className="stats-bar" role="region" aria-label="App stats">
      <div className="container">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <>
              <div className="stat-item" key={s.label}>
                <span className="stat-icon" aria-hidden="true">{s.icon}</span>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
              {i < stats.length - 1 && <div className="stat-divider" key={`div-${i}`} aria-hidden="true" />}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

export default function GlobalSettings({ settings, onChange }) {
  const fields = [
    {
      id: 'earThreshold',
      label: 'EAR Threshold',
      hint: 'Eyes are "closed" below this value. Lower = harder to trigger.',
      min: 0.12,
      max: 0.35,
      step: 0.01,
      format: (v) => v.toFixed(2),
      unit: '',
      minLabel: '0.12',
      maxLabel: '0.35',
    },
    {
      id: 'closedTime',
      label: 'Trigger Delay',
      hint: 'How many seconds eyes must stay closed before alarm fires.',
      min: 1,
      max: 15,
      step: 0.5,
      format: (v) => `${v}s`,
      unit: 's',
      minLabel: '1s',
      maxLabel: '15s',
    },
    {
      id: 'repeatInterval',
      label: 'Stage Repeat Interval',
      hint: 'Time between escalating to the next alarm stage.',
      min: 1,
      max: 10,
      step: 0.5,
      format: (v) => `${v}s`,
      unit: 's',
      minLabel: '1s',
      maxLabel: '10s',
    },
  ];

  return (
    <section
      className="glass-card global-settings"
      aria-labelledby="global-settings-title"
    >
      <h2 className="global-settings-title" id="global-settings-title">
        <span aria-hidden="true">🎛️</span> Global Settings
      </h2>

      {fields.map((f) => {
        const val = settings[f.id];
        const pct = ((val - f.min) / (f.max - f.min)) * 100;
        return (
          <div className="global-field" key={f.id}>
            <div className="global-field-header">
              <label htmlFor={`global-${f.id}`} className="global-field-label">
                {f.label}
              </label>
              <span
                className="global-field-value"
                aria-live="polite"
                aria-label={`${f.label}: ${f.format(val)}`}
              >
                {f.format(val)}
              </span>
            </div>
            <input
              id={`global-${f.id}`}
              className="global-slider"
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={val}
              style={{ '--fill-pct': `${pct}%` }}
              onChange={(e) =>
                onChange({ ...settings, [f.id]: parseFloat(e.target.value) })
              }
              aria-valuemin={f.min}
              aria-valuemax={f.max}
              aria-valuenow={val}
              aria-label={f.label}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
                {f.minLabel}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{f.hint}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
                {f.maxLabel}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

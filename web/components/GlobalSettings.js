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

      {/* Global Playback Mode */}
      <div className="global-field" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <span className="field-label-icon" aria-hidden="true">▶️</span>
              Global Playback Mode
            </label>
            <div className="mode-toggle" role="group">
              {['loop', 'duration'].map((mode) => (
                <button
                  key={mode}
                  className={`mode-btn${settings.playbackMode === mode ? ' active' : ''}`}
                  onClick={() => onChange({ ...settings, playbackMode: mode })}
                >
                  {mode === 'loop' ? '🔁 Loop Stage 4' : '⏱ Play for Duration'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {settings.playbackMode === 'loop' 
                ? 'Stage 4 will repeat infinitely until eyes open.' 
                : 'The entire alarm system will shut off after the duration limit.'}
            </p>
          </div>

          {settings.playbackMode === 'duration' && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <span className="field-label-icon" aria-hidden="true">⏱️</span>
                Time Limit
              </label>
              <select
                className="duration-select"
                value={settings.duration}
                onChange={(e) => onChange({ ...settings, duration: e.target.value })}
              >
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
                <option value="300">5 minutes</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

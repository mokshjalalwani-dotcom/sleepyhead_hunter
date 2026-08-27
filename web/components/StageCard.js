'use client';

import { useState } from 'react';

const STAGE_META = [
  { name: 'Stage 1 — Gentle', emoji: '😴', color: 'var(--stage-1)' },
  { name: 'Stage 2 — Firm',   emoji: '😪', color: 'var(--stage-2)' },
  { name: 'Stage 3 — Loud',   emoji: '😡', color: 'var(--stage-3)' },
  { name: 'Stage 4 — Nuclear',emoji: '🚨', color: 'var(--stage-4)' },
];

const DURATION_OPTIONS = [
  { label: 'Loop forever',       value: 'loop' },
  { label: '30 seconds',         value: '30' },
  { label: '1 minute',           value: '60' },
  { label: '2 minutes',          value: '120' },
  { label: '5 minutes',          value: '300' },
  { label: 'Custom (seconds)…',  value: 'custom' },
];

export default function StageCard({ stage, data, onChange }) {
  const [customDuration, setCustomDuration] = useState('');
  const idx = stage - 1;
  const meta = STAGE_META[idx];

  const handleChange = (field, value) => {
    onChange(stage, { ...data, [field]: value });
  };

  const volumePercent = Math.round(data.volume * 100);

  return (
    <article
      className="glass-card stage-card"
      data-stage={stage}
      aria-label={`Alarm stage ${stage} configuration`}
    >
      {/* Stage Header */}
      <div className="stage-header">
        <span
          className="stage-badge"
          data-stage={stage}
          aria-label={`Stage ${stage}`}
        >
          STAGE {stage}
        </span>
        <span className="stage-name">{meta.name}</span>
        <span className="stage-emoji" aria-hidden="true">{meta.emoji}</span>
      </div>

      <div className="stage-fields">

        {/* Message Text */}
        <div className="field-full">
          <label
            htmlFor={`stage-${stage}-text`}
            className="field-label"
          >
            <span className="field-label-icon" aria-hidden="true">💬</span>
            Alert Message
          </label>
          <input
            id={`stage-${stage}-text`}
            className="field-input"
            type="text"
            value={data.text}
            placeholder="e.g. उठ जा  or  wake up!"
            onChange={(e) => handleChange('text', e.target.value)}
            aria-describedby={`stage-${stage}-text-hint`}
          />
          <p id={`stage-${stage}-text-hint`} style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
            💡 Use <strong style={{ color: 'var(--cyan)' }}>Devanagari script</strong> for natural Hindi pronunciation
            (e.g. <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--amber)' }}>उठ जा</span> instead of <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>uth ja</span>).
            English works too.
          </p>
        </div>

        {/* Volume */}
        <div className="volume-field">
          <div className="field-label">
            <span className="field-label-icon" aria-hidden="true">🔊</span>
            Volume Intensity
          </div>
          <div className="volume-display">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0%</span>
            <span
              className="volume-value"
              style={{ color: meta.color }}
              aria-live="polite"
              aria-label={`Volume ${volumePercent}%`}
            >
              {volumePercent}%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100%</span>
          </div>
          <div className="volume-bar-wrap" aria-hidden="true">
            <div
              className="volume-bar-fill"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
          <input
            id={`stage-${stage}-volume`}
            className="slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={data.volume}
            onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
            aria-label={`Stage ${stage} volume: ${volumePercent}%`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={volumePercent}
          />
        </div>

        {/* Speech Rate */}
        <div>
          <div className="field-label">
            <span className="field-label-icon" aria-hidden="true">⚡</span>
            Speech Rate (WPM)
          </div>
          <div className="volume-display">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>80</span>
            <span
              className="volume-value"
              style={{ color: meta.color }}
              aria-live="polite"
            >
              {data.rate}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>250</span>
          </div>
          <div className="volume-bar-wrap" aria-hidden="true">
            <div
              className="volume-bar-fill"
              style={{ width: `${((data.rate - 80) / 170) * 100}%` }}
            />
          </div>
          <input
            id={`stage-${stage}-rate`}
            className="slider"
            type="range"
            min="80"
            max="250"
            step="5"
            value={data.rate}
            onChange={(e) => handleChange('rate', parseInt(e.target.value))}
            aria-label={`Stage ${stage} speech rate: ${data.rate} words per minute`}
          />
        </div>

        {/* Playback Mode */}
        <div>
          <div className="field-label">
            <span className="field-label-icon" aria-hidden="true">▶️</span>
            Playback Mode
          </div>
          <div
            className="mode-toggle"
            role="group"
            aria-label={`Stage ${stage} playback mode`}
          >
            <button
              id={`stage-${stage}-mode-loop`}
              className={`mode-btn${data.playbackMode === 'loop' ? ' active' : ''}`}
              onClick={() => handleChange('playbackMode', 'loop')}
              aria-pressed={data.playbackMode === 'loop'}
            >
              🔁 Loop
            </button>
            <button
              id={`stage-${stage}-mode-duration`}
              className={`mode-btn${data.playbackMode === 'duration' ? ' active' : ''}`}
              onClick={() => handleChange('playbackMode', 'duration')}
              aria-pressed={data.playbackMode === 'duration'}
            >
              ⏱ Duration
            </button>
          </div>
        </div>

        {/* Duration Selector — shown only if duration mode */}
        {data.playbackMode === 'duration' && (
          <div className="field-full">
            <label
              htmlFor={`stage-${stage}-duration`}
              className="field-label"
            >
              <span className="field-label-icon" aria-hidden="true">⏱️</span>
              Play For How Long?
            </label>
            <select
              id={`stage-${stage}-duration`}
              className="duration-select"
              value={data.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
            >
              {DURATION_OPTIONS.filter(o => o.value !== 'loop').map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {data.duration === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  id={`stage-${stage}-custom-duration`}
                  className="field-input"
                  type="number"
                  min="5"
                  max="3600"
                  placeholder="Enter seconds (e.g. 45)"
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value);
                    handleChange('customDurationSecs', e.target.value);
                  }}
                  aria-label="Custom duration in seconds"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

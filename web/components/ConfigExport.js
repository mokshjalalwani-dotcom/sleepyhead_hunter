'use client';

import { useState, useMemo } from 'react';

function durationToComment(stage) {
  if (stage.playbackMode === 'loop') return 'loop';
  if (stage.duration === 'custom') return `${stage.customDurationSecs || '?'}s`;
  const secs = parseInt(stage.duration);
  if (secs < 60) return `${secs}s`;
  return `${secs / 60}min`;
}

function durationToSeconds(stage) {
  if (stage.playbackMode === 'loop') return 'None  # loops until eyes open';
  if (stage.duration === 'custom') return stage.customDurationSecs || 30;
  return parseInt(stage.duration);
}

export default function ConfigExport({ stages, globalSettings }) {
  const [copied, setCopied] = useState(false);

  const configText = useMemo(() => {
    const lines = [];
    lines.push('# ============================================================');
    lines.push('# SleepyHead Hunter — Generated Configuration');
    lines.push('# Paste this into eye_closure_alarm.py to apply your settings');
    lines.push('# ============================================================');
    lines.push('');
    lines.push('# --- Global Thresholds ---');
    lines.push(`EAR_THRESHOLD         = ${globalSettings.earThreshold.toFixed(2)}`);
    lines.push(`CLOSED_TIME_TO_TRIGGER = ${globalSettings.closedTime}`);
    lines.push(`ALERT_REPEAT_INTERVAL  = ${globalSettings.repeatInterval}`);
    lines.push('');
    lines.push('# --- Alert Stages (4 escalating levels) ---');
    lines.push('ALERT_STAGES = [');
    stages.forEach((s, i) => {
      const dur = durationToSeconds(s);
      const durComment = durationToComment(s);
      lines.push(`    {  # Stage ${i + 1}`);
      lines.push(`        "text":          "${s.text}",`);
      lines.push(`        "volume":        ${s.volume.toFixed(2)},`);
      lines.push(`        "rate":          ${s.rate},`);
      lines.push(`        "playback_mode": "${s.playbackMode}",`);
      lines.push(`        "duration_secs": ${dur},  # ${durComment}`);
      lines.push(`        "filename":      "stage_${i + 1}.mp3",`);
      lines.push(`    },`);
    });
    lines.push(']');
    return lines.join('\n');
  }, [stages, globalSettings]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = configText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([configText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sleepyhead_config.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlight the config
  const highlighted = configText
    .replace(/^(#.*)$/gm, '<span class="py-comment">$1</span>')
    .replace(/\b(None|True|False)\b/g, '<span class="py-keyword">$1</span>')
    .replace(/"([^"]*)"/g, '<span class="py-string">"$1"</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="py-number">$1</span>');

  return (
    <aside className="export-panel" aria-label="Config export panel">
      {/* Preview */}
      <section className="glass-card export-card" aria-labelledby="export-preview-title">
        <h2 className="export-title" id="export-preview-title">
          <span aria-hidden="true">📋</span> Generated Config
        </h2>
        <div
          className="export-preview"
          role="region"
          aria-label="Configuration code preview"
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </section>

      {/* Actions */}
      <section className="glass-card export-card" aria-labelledby="export-actions-title">
        <h2 className="export-title" id="export-actions-title">
          <span aria-hidden="true">🚀</span> Apply to Your App
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.7 }}>
          Copy the config and paste it at the top of{' '}
          <span className="mono" style={{ color: 'var(--cyan)' }}>eye_closure_alarm.py</span>,
          replacing the existing constants. Then re-run the script.
        </p>
        <div className="export-actions">
          <button
            id="copy-config-btn"
            className={`btn btn-sm btn-outline${copied ? ' copy-success' : ''}`}
            onClick={handleCopy}
            aria-live="polite"
            aria-label={copied ? 'Copied to clipboard' : 'Copy config to clipboard'}
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button
            id="download-config-btn"
            className="btn btn-sm btn-amber"
            onClick={handleDownload}
            aria-label="Download config as Python file"
          >
            ⬇️ Download .py
          </button>
        </div>
      </section>

      {/* Reset */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Changes are live — your config updates instantly as you tweak settings above.
        </p>
      </div>
    </aside>
  );
}

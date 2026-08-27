'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AlarmEngine } from './AlarmEngine';
import Navbar from './Navbar';
import Footer from './Footer';

// Dynamically import WebcamCanvas to avoid SSR issues
const WebcamCanvas = dynamic(() => import('./WebcamCanvas'), { ssr: false });

const DEFAULT_STAGES = [
  { text: 'uth ja',                       volume: 0.5,  rate: 150, playbackMode: 'loop',     duration: '60'  },
  { text: 'uth jaa',                       volume: 0.65, rate: 165, playbackMode: 'loop',     duration: '60'  },
  { text: 'uth jaaaa',                     volume: 0.8,  rate: 180, playbackMode: 'duration', duration: '120' },
  { text: 'uth jaaaaaa behen ke low day',  volume: 1.0,  rate: 200, playbackMode: 'duration', duration: '120' },
];

const DEFAULT_GLOBAL = { earThreshold: 0.21, closedTime: 4.0, repeatInterval: 3.0 };

const STAGE_COLORS = ['var(--stage-1)', 'var(--stage-2)', 'var(--stage-3)', 'var(--stage-4)'];
const STAGE_LABELS = ['😴 Gentle', '😪 Firm', '😡 Loud', '🚨 Nuclear'];

export default function LiveDetector() {
  const [running,     setRunning]     = useState(false);
  const [armed,       setArmed]       = useState(true);
  const [faceFound,   setFaceFound]   = useState(false);
  const [ear,         setEar]         = useState(null);
  const [closedSecs,  setClosedSecs]  = useState(0);
  const [alarmActive, setAlarmActive] = useState(false);
  const [currentStage,setCurrentStage]= useState(0); // 0 = no alarm, 1-4 = stage
  const [stages,      setStages]      = useState(DEFAULT_STAGES);
  const [global,      setGlobal]      = useState(DEFAULT_GLOBAL);
  const [showConfig,  setShowConfig]  = useState(false);

  const engineRef       = useRef(null);
  const closedStartRef  = useRef(null);
  const lastAlertRef    = useRef(0);
  const stageIndexRef   = useRef(0);
  const armedRef        = useRef(true);
  const globalRef       = useRef(DEFAULT_GLOBAL);
  const stagesRef       = useRef(DEFAULT_STAGES);

  // Keep refs in sync
  useEffect(() => { armedRef.current  = armed;  }, [armed]);
  useEffect(() => { globalRef.current = global; }, [global]);
  useEffect(() => { stagesRef.current = stages; }, [stages]);

  // Init alarm engine
  useEffect(() => {
    engineRef.current = new AlarmEngine();
    return () => engineRef.current?.destroy();
  }, []);

  // Main EAR handler — called each frame
  const handleEAR = useCallback((avgEAR) => {
    setEar(avgEAR);

    if (!armedRef.current || avgEAR === null) {
      // Eyes opened or unarmed — reset
      if (avgEAR !== null && avgEAR >= globalRef.current.earThreshold) {
        closedStartRef.current = null;
        setClosedSecs(0);
        if (stageIndexRef.current > 0) {
          engineRef.current?.silence();
          setAlarmActive(false);
          setCurrentStage(0);
          stageIndexRef.current = 0;
          lastAlertRef.current  = 0;
          // Auto re-arm after eyes open
          setArmed(true);
        }
      }
      return;
    }

    const threshold = globalRef.current.earThreshold;

    if (avgEAR < threshold) {
      // Eyes closed
      if (!closedStartRef.current) closedStartRef.current = performance.now();
      const elapsed = (performance.now() - closedStartRef.current) / 1000;
      setClosedSecs(elapsed);

      const { closedTime, repeatInterval } = globalRef.current;
      const now = performance.now() / 1000;

      if (elapsed >= closedTime) {
        // Trigger alarm?
        if (lastAlertRef.current === 0 || now - lastAlertRef.current >= repeatInterval) {
          const stageIdx   = stageIndexRef.current;
          const stageCfg   = stagesRef.current[stageIdx];
          engineRef.current?.fire(stageCfg);
          setAlarmActive(true);
          setCurrentStage(stageIdx + 1);
          lastAlertRef.current = now;

          // Advance stage
          if (stageIdx < stagesRef.current.length - 1) {
            stageIndexRef.current = stageIdx + 1;
          }
        }
      }
    } else {
      // Eyes open — reset
      closedStartRef.current = null;
      setClosedSecs(0);
      if (stageIndexRef.current > 0) {
        engineRef.current?.silence();
        setAlarmActive(false);
        setCurrentStage(0);
        stageIndexRef.current = 0;
        lastAlertRef.current  = 0;
        setArmed(true);
      }
    }
  }, []);

  const handleFaceDetected = useCallback((found) => {
    setFaceFound(found);
    if (!found) {
      closedStartRef.current = null;
      setClosedSecs(0);
    }
  }, []);

  const toggleArmed = () => {
    if (armed) {
      engineRef.current?.silence();
      setAlarmActive(false);
      setCurrentStage(0);
      stageIndexRef.current = 0;
      lastAlertRef.current  = 0;
      closedStartRef.current= null;
      setClosedSecs(0);
    }
    setArmed((p) => !p);
  };

  const handleStart = () => setRunning(true);
  const handleStop  = () => {
    setRunning(false);
    engineRef.current?.silence();
    setAlarmActive(false);
    setCurrentStage(0);
    setEar(null);
    setFaceFound(false);
    setClosedSecs(0);
    stageIndexRef.current = 0;
    lastAlertRef.current  = 0;
    closedStartRef.current= null;
  };

  const earPct = ear !== null ? Math.min(1, ear / 0.4) * 100 : 0;
  const closedPct = Math.min(1, closedSecs / global.closedTime) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main
        style={{ flex: 1, paddingTop: '90px', paddingBottom: '40px', position: 'relative', zIndex: 1 }}
        id="main-content"
      >
        {/* Alarm pulse background */}
        {alarmActive && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
              background: `radial-gradient(ellipse at center, ${STAGE_COLORS[currentStage - 1]}18 0%, transparent 70%)`,
              animation: 'alarm-pulse 0.8s ease-in-out infinite alternate',
            }}
          />
        )}

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

            {/* ── LEFT: Video Feed ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Status Bar */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px',
                  background: 'rgba(9,21,37,0.8)',
                  border: `1px solid ${alarmActive ? STAGE_COLORS[currentStage - 1] : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  backdropFilter: 'blur(12px)',
                  transition: 'border-color 0.3s',
                  flexWrap: 'wrap', gap: '10px',
                }}
                role="status"
                aria-live="polite"
              >
                {/* Face status */}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: !running ? 'var(--text-muted)' : faceFound ? 'var(--green-ok)' : 'var(--red-alert)',
                  boxShadow: faceFound && running ? '0 0 8px var(--green-ok)' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Space Mono, monospace' }}>
                  {!running ? 'STOPPED' : faceFound ? 'FACE DETECTED' : 'NO FACE'}
                </span>

                <div style={{ flex: 1 }} />

                {/* EAR */}
                {ear !== null && (
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: ear < global.earThreshold ? 'var(--red-alert)' : 'var(--cyan)' }}>
                    EAR {ear.toFixed(3)}
                  </span>
                )}

                {/* Arm/Disarm */}
                <button
                  id="arm-toggle-btn"
                  onClick={toggleArmed}
                  disabled={!running}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Space Mono, monospace',
                    border: `1px solid ${armed ? 'rgba(0,230,118,0.4)' : 'rgba(255,61,87,0.4)'}`,
                    background: armed ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,87,0.1)',
                    color: armed ? 'var(--green-ok)' : 'var(--red-alert)',
                    cursor: running ? 'pointer' : 'not-allowed',
                    opacity: running ? 1 : 0.4,
                  }}
                  aria-pressed={armed}
                  aria-label={armed ? 'Alarm armed — click to disarm' : 'Alarm disarmed — click to rearm'}
                >
                  {armed ? '🟢 ARMED' : '🔴 DISARMED'}
                </button>
              </div>

              {/* Camera Feed */}
              <WebcamCanvas
                running={running}
                onEAR={handleEAR}
                onFaceDetected={handleFaceDetected}
              />

              {/* Alarm Stage Indicator */}
              {alarmActive && (
                <div
                  style={{
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: `${STAGE_COLORS[currentStage - 1]}18`,
                    border: `1px solid ${STAGE_COLORS[currentStage - 1]}55`,
                    display: 'flex', alignItems: 'center', gap: '12px',
                    animation: 'alarm-pulse 0.6s ease-in-out infinite alternate',
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  <span style={{ fontSize: '24px' }}>
                    {['😴','😪','😡','🚨'][currentStage - 1]}
                  </span>
                  <div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: STAGE_COLORS[currentStage - 1], fontSize: '1rem' }}>
                      ALARM ACTIVE — {STAGE_LABELS[currentStage - 1].toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
                      Stage {currentStage} of 4 · "{stages[currentStage - 1]?.text}"
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    id="silence-alarm-btn"
                    onClick={toggleArmed}
                    style={{
                      padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    }}
                    aria-label="Silence alarm"
                  >
                    🔕 Silence
                  </button>
                </div>
              )}

              {/* Start / Stop */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {!running ? (
                  <button
                    id="start-detector-btn"
                    className="btn btn-primary"
                    onClick={handleStart}
                    style={{ flex: 1, justifyContent: 'center' }}
                    aria-label="Start eye detection"
                  >
                    👁️ Start Detecting
                  </button>
                ) : (
                  <button
                    id="stop-detector-btn"
                    className="btn btn-outline"
                    onClick={handleStop}
                    style={{ flex: 1, justifyContent: 'center' }}
                    aria-label="Stop eye detection"
                  >
                    ⏹ Stop
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: Meters + Config ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }}>

              {/* EAR Meter */}
              <div className="glass-card" style={{ padding: '20px' }} role="region" aria-label="EAR meter">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>EYE ASPECT RATIO</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '14px', fontWeight: 700, color: ear !== null && ear < global.earThreshold ? 'var(--red-alert)' : 'var(--cyan)' }}>
                    {ear !== null ? ear.toFixed(3) : '—'}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${earPct}%`,
                    background: ear !== null && ear < global.earThreshold
                      ? 'linear-gradient(90deg, var(--red-alert), var(--amber))'
                      : 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
                    borderRadius: '4px', transition: 'width 0.1s ease, background 0.3s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>0.00</span>
                  <span style={{ fontSize: '10px', color: 'var(--amber)', fontFamily: 'Space Mono, monospace' }}>▼ {global.earThreshold.toFixed(2)}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>0.40</span>
                </div>
              </div>

              {/* Closed Timer */}
              <div className="glass-card" style={{ padding: '20px' }} role="region" aria-label="Eye closed timer">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>EYES CLOSED</span>
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: '14px', fontWeight: 700,
                    color: closedSecs > 0 ? (alarmActive ? 'var(--red-alert)' : 'var(--amber)') : 'var(--text-muted)',
                  }}
                    aria-live="polite"
                    aria-label={`Eyes closed for ${closedSecs.toFixed(1)} seconds`}
                  >
                    {closedSecs.toFixed(1)}s
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${closedPct}%`,
                    background: alarmActive
                      ? 'linear-gradient(90deg, var(--amber), var(--red-alert))'
                      : 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
                    borderRadius: '4px', transition: 'width 0.1s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>0s</span>
                  <span style={{ fontSize: '10px', color: 'var(--amber)', fontFamily: 'Space Mono, monospace' }}>alarm @ {global.closedTime}s</span>
                </div>
              </div>

              {/* Stage Indicators */}
              <div className="glass-card" style={{ padding: '20px' }} role="region" aria-label="Alarm stage indicators">
                <div style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '14px' }}>
                  ESCALATION STAGES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stages.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 12px', borderRadius: '8px',
                        background: currentStage === i + 1 ? `${STAGE_COLORS[i]}18` : 'transparent',
                        border: `1px solid ${currentStage === i + 1 ? STAGE_COLORS[i] + '55' : 'var(--border)'}`,
                        transition: 'all 0.2s',
                      }}
                      aria-current={currentStage === i + 1 ? 'true' : undefined}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: currentStage === i + 1 ? STAGE_COLORS[i] : 'var(--text-muted)',
                        boxShadow: currentStage === i + 1 ? `0 0 8px ${STAGE_COLORS[i]}` : 'none',
                        flexShrink: 0,
                        animation: currentStage === i + 1 ? 'dot-blink 0.6s infinite' : 'none',
                      }} />
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: currentStage === i + 1 ? STAGE_COLORS[i] : 'var(--text-muted)' }}>
                        S{i + 1}
                      </span>
                      <span style={{ fontSize: '12px', color: currentStage === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{s.text}"
                      </span>
                      <span style={{ fontSize: '10px', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>
                        {Math.round(s.volume * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Config Toggle */}
              <button
                id="toggle-config-btn"
                className="btn btn-outline btn-sm"
                onClick={() => setShowConfig((p) => !p)}
                style={{ justifyContent: 'center' }}
                aria-expanded={showConfig}
                aria-controls="inline-config"
              >
                {showConfig ? '▲ Hide Settings' : '⚙️ Customize Alarm Stages'}
              </button>

              {/* Inline Stage Config */}
              {showConfig && (
                <div id="inline-config" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stages.map((s, i) => (
                    <InlineStageCard
                      key={i}
                      stage={i + 1}
                      data={s}
                      onChange={(newData) => {
                        setStages((prev) => {
                          const updated = [...prev];
                          updated[i] = newData;
                          return updated;
                        });
                      }}
                    />
                  ))}

                  {/* Global quick settings */}
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      GLOBAL SETTINGS
                    </div>
                    {[
                      { key: 'earThreshold', label: 'EAR Threshold', min: 0.12, max: 0.35, step: 0.01, fmt: (v) => v.toFixed(2) },
                      { key: 'closedTime',   label: 'Trigger Delay', min: 1,    max: 15,   step: 0.5,  fmt: (v) => `${v}s`     },
                      { key: 'repeatInterval',label: 'Repeat Interval',min: 1, max: 10,   step: 0.5,  fmt: (v) => `${v}s`     },
                    ].map((f) => (
                      <div key={f.key} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label htmlFor={`live-${f.key}`} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Space Mono, monospace' }}>
                            {f.label}
                          </label>
                          <span style={{ fontSize: '11px', color: 'var(--cyan)', fontFamily: 'Space Mono, monospace' }}>
                            {f.fmt(global[f.key])}
                          </span>
                        </div>
                        <input
                          id={`live-${f.key}`}
                          className="global-slider"
                          type="range" min={f.min} max={f.max} step={f.step}
                          value={global[f.key]}
                          style={{ '--fill-pct': `${((global[f.key] - f.min) / (f.max - f.min)) * 100}%` }}
                          onChange={(e) => setGlobal((p) => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                          aria-label={f.label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes alarm-pulse {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Compact inline stage config card ── */
function InlineStageCard({ stage, data, onChange }) {
  const color = STAGE_COLORS[stage - 1];

  return (
    <div
      className="glass-card"
      style={{ padding: '16px', borderLeft: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          padding: '2px 8px', borderRadius: '100px', fontSize: '10px',
          fontWeight: 700, fontFamily: 'Space Mono, monospace',
          background: `${color}18`, color,
        }}>
          S{stage}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{STAGE_LABELS[stage - 1]}</span>
      </div>

      {/* Message */}
      <input
        id={`live-stage-${stage}-text`}
        className="field-input"
        style={{ marginBottom: '10px', fontSize: '13px' }}
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Alert message..."
        aria-label={`Stage ${stage} message`}
      />

      {/* Volume + Rate row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor={`live-stage-${stage}-vol`} style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>VOL</label>
            <span style={{ fontSize: '10px', color, fontFamily: 'Space Mono, monospace' }}>{Math.round(data.volume * 100)}%</span>
          </div>
          <input id={`live-stage-${stage}-vol`} className="slider" type="range" min="0" max="1" step="0.05"
            value={data.volume} onChange={(e) => onChange({ ...data, volume: parseFloat(e.target.value) })}
            aria-label={`Stage ${stage} volume`}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor={`live-stage-${stage}-rate`} style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>WPM</label>
            <span style={{ fontSize: '10px', color, fontFamily: 'Space Mono, monospace' }}>{data.rate}</span>
          </div>
          <input id={`live-stage-${stage}-rate`} className="slider" type="range" min="80" max="250" step="5"
            value={data.rate} onChange={(e) => onChange({ ...data, rate: parseInt(e.target.value) })}
            aria-label={`Stage ${stage} speech rate`}
          />
        </div>
      </div>

      {/* Playback Mode */}
      <div className="mode-toggle" role="group" aria-label={`Stage ${stage} playback mode`}>
        {['loop', 'duration'].map((mode) => (
          <button
            key={mode}
            id={`live-stage-${stage}-mode-${mode}`}
            className={`mode-btn${data.playbackMode === mode ? ' active' : ''}`}
            onClick={() => onChange({ ...data, playbackMode: mode })}
            aria-pressed={data.playbackMode === mode}
          >
            {mode === 'loop' ? '🔁 Loop' : '⏱ Duration'}
          </button>
        ))}
      </div>

      {data.playbackMode === 'duration' && (
        <select
          id={`live-stage-${stage}-duration`}
          className="duration-select"
          style={{ marginTop: '10px' }}
          value={data.duration}
          onChange={(e) => onChange({ ...data, duration: e.target.value })}
          aria-label={`Stage ${stage} duration`}
        >
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
          <option value="120">2 minutes</option>
          <option value="300">5 minutes</option>
          <option value="custom">Custom...</option>
        </select>
      )}
    </div>
  );
}

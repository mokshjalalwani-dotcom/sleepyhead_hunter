'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import StageCard from '@/components/StageCard';
import GlobalSettings from '@/components/GlobalSettings';
import ConfigExport from '@/components/ConfigExport';
import Footer from '@/components/Footer';

// Default values matching eye_closure_alarm.py exactly
const DEFAULT_STAGES = [
  { text: 'उठ जा',                volume: 0.5,  rate: 150 },
  { text: 'उठ जाओ यार',          volume: 0.65, rate: 165 },
  { text: 'अरे उठो! सो मत जाओ', volume: 0.8,  rate: 180 },
  { text: 'उठो अभी! बिल्कुल अभी!', volume: 1.0, rate: 200 },
];

const DEFAULT_GLOBAL = {
  earThreshold: 0.21,
  closedTime: 4.0,
  repeatInterval: 3.0,
  playbackMode: 'loop',
  duration: '60'
};

export default function ConfigurePage() {
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [globalSettings, setGlobalSettings] = useState(DEFAULT_GLOBAL);

  const handleStageChange = (stageNum, newData) => {
    setStages((prev) => {
      const updated = [...prev];
      updated[stageNum - 1] = newData;
      return updated;
    });
  };

  const handleReset = () => {
    setStages(DEFAULT_STAGES);
    setGlobalSettings(DEFAULT_GLOBAL);
  };

  return (
    <>
      <Navbar />
      <main className="config-page" id="main-content">
        <div className="container">

          {/* Header */}
          <header className="config-header" aria-labelledby="config-page-title">
            <span className="section-label">// ALARM CONFIGURATOR</span>
            <h1 className="section-title" id="config-page-title">
              Configure Your Alarm Stages
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Customize all 4 escalating alarm stages. Set the message, volume,
              speech rate, and whether it loops or plays for a fixed duration.
              Your config exports as ready-to-paste Python code.
            </p>
            <button
              id="reset-config-btn"
              className="btn btn-outline btn-sm"
              onClick={handleReset}
              style={{ marginTop: '20px' }}
              aria-label="Reset all settings to defaults"
            >
              ↺ Reset to Defaults
            </button>
          </header>

          {/* Escalation Info */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              flexWrap: 'wrap',
            }}
            role="note"
            aria-label="Stage escalation order"
          >
            {['STAGE 1', 'STAGE 2', 'STAGE 3', 'STAGE 4'].map((s, i) => (
              <>
                <span
                  key={s}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontFamily: 'Space Mono, monospace',
                    fontWeight: 700,
                    background: [
                      'rgba(0,230,118,0.12)',
                      'rgba(255,214,0,0.12)',
                      'rgba(255,140,0,0.12)',
                      'rgba(255,61,87,0.12)',
                    ][i],
                    color: ['var(--stage-1)', 'var(--stage-2)', 'var(--stage-3)', 'var(--stage-4)'][i],
                    border: `1px solid ${['rgba(0,230,118,0.2)', 'rgba(255,214,0,0.2)', 'rgba(255,140,0,0.2)', 'rgba(255,61,87,0.2)'][i]}`,
                  }}
                >
                  {s}
                </span>
                {i < 3 && (
                  <span key={`arr-${i}`} style={{ color: 'var(--text-muted)', fontSize: '16px' }} aria-hidden="true">→</span>
                )}
              </>
            ))}
          </div>

          {/* Main Layout */}
          <div className="config-layout">
            {/* Left: Stages + Global */}
            <div>
              <div className="stages-container" role="list" aria-label="Alarm stages">
                {stages.map((stageData, i) => (
                  <div role="listitem" key={i}>
                    <StageCard
                      stage={i + 1}
                      data={stageData}
                      onChange={handleStageChange}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <GlobalSettings
                  settings={globalSettings}
                  onChange={setGlobalSettings}
                />
              </div>
            </div>

            {/* Right: Export */}
            <ConfigExport stages={stages} globalSettings={globalSettings} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

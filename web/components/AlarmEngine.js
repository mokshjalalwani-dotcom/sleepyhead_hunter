'use client';

/**
 * AlarmEngine — manages the Web Speech API escalating alarm.
 * Exposes fire(stage, stageConfig) and silence() methods.
 */

const LEFT_EYE  = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

export { LEFT_EYE, RIGHT_EYE };

export function euclideanDist(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function computeEAR(landmarks, indices) {
  const pts = indices.map((i) => landmarks[i]);
  const v1 = euclideanDist(pts[1], pts[5]);
  const v2 = euclideanDist(pts[2], pts[4]);
  const h  = euclideanDist(pts[0], pts[3]);
  if (h === 0) return 0;
  return (v1 + v2) / (2 * h);
}

export class AlarmEngine {
  constructor() {
    this._utterance      = null;
    this._loopActive     = false;
    this._durationTimer  = null;
    this._currentStage   = null;
    this._onFire         = null; // callback when alarm fires
  }

  onFire(cb) {
    this._onFire = cb;
  }

  _getVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer Indian voices for the Hinglish effect
    const preferred = voices.find(
      (v) => v.lang === 'hi-IN' || v.lang === 'en-IN'
    );
    return preferred || voices[0] || null;
  }

  _buildUtterance(text, volume, rate) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.volume = Math.max(0, Math.min(1, volume));
    // Web Speech rate: 1.0 = normal, range ~0.1–10
    // Map WPM (80–250) to rate (0.6–1.8)
    utter.rate   = 0.6 + ((rate - 80) / 170) * 1.2;
    utter.pitch  = 1.1;
    const voice  = this._getVoice();
    if (voice) utter.voice = voice;
    return utter;
  }

  fire(stageConfig) {
    this.silence(); // always stop previous before firing

    this._loopActive    = true;
    this._currentStage  = stageConfig;
    if (this._onFire) this._onFire(stageConfig);

    const speak = () => {
      if (!this._loopActive) return;
      const utter = this._buildUtterance(
        stageConfig.text,
        stageConfig.volume,
        stageConfig.rate
      );
      utter.onend = () => {
        if (this._loopActive && stageConfig.playbackMode === 'loop') {
          // small gap between repeats
          setTimeout(speak, 300);
        }
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    speak();

    // Duration mode: auto-silence after N seconds
    if (stageConfig.playbackMode === 'duration') {
      const secs =
        stageConfig.duration === 'custom'
          ? parseInt(stageConfig.customDurationSecs || 30) * 1000
          : parseInt(stageConfig.duration) * 1000;
      this._durationTimer = setTimeout(() => this.silence(), secs);
    }
  }

  silence() {
    this._loopActive = false;
    if (this._durationTimer) {
      clearTimeout(this._durationTimer);
      this._durationTimer = null;
    }
    window.speechSynthesis.cancel();
  }

  destroy() {
    this.silence();
  }
}

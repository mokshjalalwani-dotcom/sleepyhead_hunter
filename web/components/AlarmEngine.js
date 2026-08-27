'use client';

// ─── Eye landmark indices (same as eye_closure_alarm.py) ─────────────────────
export const LEFT_EYE  = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

export function euclideanDist(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function computeEAR(landmarks, indices) {
  const pts = indices.map((i) => landmarks[i]);
  const v1  = euclideanDist(pts[1], pts[5]);
  const v2  = euclideanDist(pts[2], pts[4]);
  const h   = euclideanDist(pts[0], pts[3]);
  if (h === 0) return 0;
  return (v1 + v2) / (2 * h);
}

// ─── Available Neural Voices ─────────────────────────────────────────────────
export const VOICES = [
  { id: 'hi-IN-SwaraNeural',   label: '🇮🇳 Swara (Hindi female)'   },
  { id: 'hi-IN-MadhurNeural',  label: '🇮🇳 Madhur (Hindi male)'    },
  { id: 'en-IN-NeerjaNeural',  label: '🇮🇳 Neerja (Indian English female)' },
  { id: 'en-IN-PrabhatNeural', label: '🇮🇳 Prabhat (Indian English male)'  },
  { id: 'en-US-AriaNeural',    label: '🇺🇸 Aria (US female)'       },
  { id: 'en-US-GuyNeural',     label: '🇺🇸 Guy (US male)'          },
];

// ─── AlarmEngine ─────────────────────────────────────────────────────────────

export class AlarmEngine {
  constructor(voice = 'hi-IN-SwaraNeural') {
    this._voice          = voice;
    this._audio          = null;
    this._loopActive     = false;
    this._durationTimer  = null;
    this._audioCache     = new Map(); // cacheKey → blobURL
    this._fetching       = false;
  }

  setVoice(voice) {
    this._voice = voice;
  }

  // ── Fetch MP3 from our /api/tts route ──────────────────────────────────────
  async _fetchAudio(text, rate, volume) {
    const key = `${text}|${this._voice}|${rate}`;
    if (this._audioCache.has(key)) return this._audioCache.get(key);

    const params = new URLSearchParams({
      text,
      voice:  this._voice,
      rate:   String(rate),
      volume: String(volume),
    });

    const res = await fetch(`/api/tts?${params}`);
    if (!res.ok) throw new Error(`TTS API ${res.status}`);

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    this._audioCache.set(key, url);
    return url;
  }

  // ── Core fire method ───────────────────────────────────────────────────────
  fire(stageConfig) {
    this.silence(); // cancel any previous alarm
    this._loopActive = true;

    const play = async () => {
      if (!this._loopActive) return;

      let url;
      try {
        url = await this._fetchAudio(stageConfig.text, stageConfig.rate, stageConfig.volume);
      } catch (err) {
        console.warn('[AlarmEngine] TTS API failed, using fallback', err);
        this._fallbackSpeak(stageConfig);
        return;
      }

      if (!this._loopActive) return; // silenced while fetching

      const audio   = new Audio(url);
      audio.volume  = Math.max(0, Math.min(1, stageConfig.volume));
      this._audio   = audio;

      audio.onended = () => {
        if (this._loopActive && stageConfig.playbackMode === 'loop') {
          setTimeout(play, 2000);
        }
      };

      audio.onerror = () => {
        // Blob may have expired — clear cache and retry once
        this._audioCache.delete(`${stageConfig.text}|${this._voice}|${stageConfig.rate}`);
        if (this._loopActive) setTimeout(play, 2000);
      };

      try {
        await audio.play();
      } catch (err) {
        // Autoplay blocked — can happen if user hasn't interacted yet
        console.warn('[AlarmEngine] Audio play blocked:', err);
        this._fallbackSpeak(stageConfig);
      }
    };

    play();

    // Duration mode: auto-silence
    if (stageConfig.playbackMode === 'duration') {
      const ms =
        stageConfig.duration === 'custom'
          ? parseInt(stageConfig.customDurationSecs || 30) * 1000
          : parseInt(stageConfig.duration) * 1000;
      this._durationTimer = setTimeout(() => this.silence(), ms);
    }
  }

  // ── Fallback: browser speech synth (robotic but works offline) ────────────
  _fallbackSpeak(stageConfig) {
    if (typeof window === 'undefined') return;
    const utter     = new SpeechSynthesisUtterance(stageConfig.text);
    utter.volume    = stageConfig.volume;
    utter.rate      = 0.6 + ((stageConfig.rate - 80) / 170) * 1.2;
    utter.pitch     = 1.0;
    utter.onend     = () => {
      if (this._loopActive && stageConfig.playbackMode === 'loop') {
        setTimeout(() => this._fallbackSpeak(stageConfig), 2000);
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  silence() {
    this._loopActive = false;

    if (this._audio) {
      this._audio.pause();
      this._audio.src = '';
      this._audio     = null;
    }

    if (this._durationTimer) {
      clearTimeout(this._durationTimer);
      this._durationTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }

  destroy() {
    this.silence();
    // Revoke all blob URLs
    this._audioCache.forEach((url) => URL.revokeObjectURL(url));
    this._audioCache.clear();
  }
}

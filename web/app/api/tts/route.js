/**
 * TTS API Route — proxies Google Translate TTS
 * Simple HTTP GET, no WebSocket complexity, works reliably on Vercel.
 * Supports Hindi (hi), English (en), and auto-detection from voice name.
 */

// Map Edge-TTS voice names → Google TTS lang codes
const VOICE_TO_LANG = {
  'hi-IN-SwaraNeural':   'hi',
  'hi-IN-MadhurNeural':  'hi',
  'en-IN-NeerjaNeural':  'en',
  'en-IN-PrabhatNeural': 'en',
  'en-US-AriaNeural':    'en',
  'en-US-GuyNeural':     'en',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text   = (searchParams.get('text')  || 'wake up').slice(0, 200);
  const voice  = searchParams.get('voice')  || 'hi-IN-SwaraNeural';
  const speedParam = parseFloat(searchParams.get('rate') || '150');

  // Map WPM (80–250) to Google TTS speed (0.5–1.5); 150 WPM = normal (1.0)
  const speed = Math.max(0.5, Math.min(1.5, 0.5 + ((speedParam - 80) / 170)));

  const lang = VOICE_TO_LANG[voice] || 'hi';

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8` +
    `&q=${encodeURIComponent(text)}` +
    `&tl=${lang}` +
    `&ttsspeed=${speed.toFixed(2)}` +
    `&client=tw-ob`;

  try {
    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer':    'https://translate.google.com/',
        'Accept':     'audio/mpeg, audio/*',
      },
    });

    if (!res.ok) {
      console.error('[TTS] Google TTS returned', res.status);
      return new Response(JSON.stringify({ error: `Upstream TTS error ${res.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const audio = await res.arrayBuffer();

    if (audio.byteLength < 100) {
      return new Response(JSON.stringify({ error: 'Empty audio returned' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(audio, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('[TTS] Fetch error:', err?.message);
    return new Response(JSON.stringify({ error: 'TTS fetch failed', detail: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

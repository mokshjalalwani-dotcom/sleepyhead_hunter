import WebSocket from 'ws';
import { randomUUID } from 'crypto';

// Microsoft Edge TTS unofficial API — same endpoint used by edge-tts Python library
const TOKEN    = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WS_URL   = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&ConnectionId=`;
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

function edgeTimestamp() {
  return new Date().toISOString();
}

/**
 * Calls the Microsoft Edge Neural TTS WebSocket API.
 * Returns an MP3 Buffer.
 */
function synthesize(text, voice, rateStr, volumeStr) {
  return new Promise((resolve, reject) => {
    const connId  = randomUUID().replace(/-/g, '');
    const reqId   = randomUUID().replace(/-/g, '');
    const url     = `${WS_URL}${connId}`;

    const ws = new WebSocket(url, {
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Accept-Encoding':  'gzip, deflate, br',
        'Accept-Language':  'en-US,en;q=0.9',
        'Cache-Control':    'no-cache',
        'Pragma':           'no-cache',
        Origin:             'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      },
    });

    const chunks = [];
    let timedOut  = false;

    // Safety timeout — Vercel serverless limit
    const timer = setTimeout(() => {
      timedOut = true;
      ws.terminate();
      if (chunks.length > 0) resolve(Buffer.concat(chunks));
      else reject(new Error('Edge TTS timeout'));
    }, 9000);

    ws.on('open', () => {
      // 1. Send speech config
      ws.send(
        `X-Timestamp:${edgeTimestamp()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: OUTPUT_FORMAT,
              },
            },
          },
        })
      );

      // 2. Send SSML — derive xml:lang from voice name (e.g. hi-IN-SwaraNeural → hi-IN)
      const langCode = voice.split('-').slice(0, 2).join('-'); // "hi-IN", "en-US", etc.
      const ssml =
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${langCode}">` +
        `<voice name="${voice}">` +
        `<prosody rate="${rateStr}" volume="${volumeStr}">${escapeXml(text)}</prosody>` +
        `</voice></speak>`;

      ws.send(
        `X-RequestId:${reqId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${edgeTimestamp()}\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      );
    });

    ws.on('message', (data, isBinary) => {
      if (timedOut) return;

      if (isBinary) {
        // Binary message format:
        //   [0..1]  uint16 BE  = header byte length
        //   [2..N]  utf8 text  = header
        //   [N+1..] bytes      = audio payload
        const headerLen  = data.readUInt16BE(0);
        const header     = data.slice(2, 2 + headerLen).toString('utf8');
        const audio      = data.slice(2 + headerLen);

        if (header.includes('Path:audio') && audio.length > 0) {
          chunks.push(audio);
        }
      } else {
        const msg = data.toString('utf8');
        if (msg.includes('Path:turn.end')) {
          clearTimeout(timer);
          ws.close();
          resolve(Buffer.concat(chunks));
        }
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    ws.on('close', () => {
      clearTimeout(timer);
      if (!timedOut && chunks.length > 0) resolve(Buffer.concat(chunks));
    });
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Next.js Route Handler ───────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text   = (searchParams.get('text')   || 'wake up').slice(0, 300);
  const voice  = searchParams.get('voice')   || 'hi-IN-SwaraNeural';
  const wpm    = parseFloat(searchParams.get('rate')   || '150');
  const vol    = parseFloat(searchParams.get('volume') || '1.0');

  // Map WPM (80–250) → Edge rate string: 150 = "+0%", 80 = "-40%", 250 = "+60%"
  const ratePct  = Math.round(((wpm - 150) / 150) * 60);
  const rateStr  = `${ratePct >= 0 ? '+' : ''}${ratePct}%`;
  const volumeStr = `${Math.round(vol * 100)}%`;

  try {
    const mp3 = await synthesize(text, voice, rateStr, volumeStr);

    return new Response(mp3, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Content-Length': String(mp3.length),
        // Cache identical requests for 24 hours at Vercel edge
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('[TTS] Error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'TTS synthesis failed', detail: err?.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

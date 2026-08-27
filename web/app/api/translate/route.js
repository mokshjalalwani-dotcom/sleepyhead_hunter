export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  if (!text) {
    return new Response(JSON.stringify({ translation: '' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      }
    });

    if (!res.ok) {
      throw new Error(`Google Translate API error: ${res.status}`);
    }

    const data = await res.json();
    
    // The response format is deeply nested arrays: [[[ "translation", "original", null, null, 10 ]], ...]
    let translation = '';
    if (data && data[0]) {
      translation = data[0].map(item => item[0]).join('');
    }

    return new Response(JSON.stringify({ translation }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400' 
      },
    });
  } catch (err) {
    console.error('[Translate API Error]', err);
    return new Response(JSON.stringify({ error: 'Translation failed', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

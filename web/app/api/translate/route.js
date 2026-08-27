import { translate } from '@vitalets/google-translate-api';

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
    const { text: translation } = await translate(text, { to: 'hi' });
    
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

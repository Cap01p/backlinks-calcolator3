export async function post({ request }) {
  const { url } = await request.json();
  const apiKey = import.meta.env.RAPIDAPI_KEY || '4dd7a616abmshe432066db06c437p1cea1fjsnb7af23cf2dcf';

  try {
    console.log(`Fetching spam score for URL: ${url}`);
    const response = await fetch(`https://moz-da-pa-spam-score.p.rapidapi.com/dapa?domain=${url}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'moz-da-pa-spam-score.p.rapidapi.com'
      }
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    if (data.spam_score === undefined) {
      throw new Error('Spam score not found in API response');
    }

    return new Response(JSON.stringify({ spamScore: data.spam_score }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error in spam score API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

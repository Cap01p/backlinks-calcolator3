const cache = new Map();
const rateLimitMap = new Map();

export async function post({ request }) {
  const { url } = await request.json();
  const apiKey = import.meta.env.RAPIDAPI_KEY || '4dd7a616abmshe432066db06c437p1cea1fjsnb7af23cf2dcf';

  console.log('Received request for URL:', url);

  // Simple rate limiting
  const now = Date.now();
  const rateLimit = rateLimitMap.get(url) || 0;
  if (now - rateLimit < 60000) { // 1 minute cooldown
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }), {
      status: 429,
      headers: { "Content-Type": "application/json" }
    });
  }
  rateLimitMap.set(url, now);

  // Check cache
  if (cache.has(url)) {
    const cachedData = cache.get(url);
    if (now - cachedData.timestamp < 3600000) { // 1 hour cache
      return new Response(JSON.stringify(cachedData.data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  try {
    const response = await fetch(`https://ahrefs1.p.rapidapi.com/v1/backlink-checker?url=${url}&mode=subdomains`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'ahrefs1.p.rapidapi.com'
      }
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));

    // Cache the result
    cache.set(url, { timestamp: now, data });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Error in backlinks API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

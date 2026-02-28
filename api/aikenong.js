export default async function handler(req, res) {
  // path is captured from rewrite: /api/aikenong?path=...
  const { path, ...restQuery } = req.query;
  
  // Reconstruct the query string from remaining parameters (lat, lon, etc.)
  const queryString = new URLSearchParams(restQuery).toString();
  const targetUrl = `https://znapi.aikenong.com.cn/${path}${queryString ? `?${queryString}` : ''}`;

  console.log(`[Proxy] Requesting: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // 'User-Agent': 'Mozilla/5.0 ...' // Sometimes needed if API blocks empty UA
      },
    });

    console.log(`[Proxy] Response status: ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return res.status(response.status).json(data);
    } else {
        const text = await response.text();
        return res.status(response.status).send(text);
    }
    
  } catch (error) {
    console.error(`[Proxy] Error: ${error.message}`);
    return res.status(500).json({ error: 'Failed to fetch data from Aikenong API', details: error.message });
  }
}

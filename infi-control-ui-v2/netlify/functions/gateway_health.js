export default async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const baseUrl = String(body.baseUrl || '').replace(/\/$/, '');
  const token = String(body.token || '');

  if (!baseUrl || !token) {
    return new Response(JSON.stringify({ error: 'baseUrl and token required' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const url = `${baseUrl}/v1/status`;

  const resp = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, data }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
};

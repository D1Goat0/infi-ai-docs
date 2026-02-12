export default async (req, context) => {
  // Basic CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const gatewayUrl = (process.env.GATEWAY_URL || '').replace(/\/$/, '');
  const gatewayToken = process.env.GATEWAY_TOKEN || '';

  if (!gatewayUrl || !gatewayToken) {
    return new Response(
      JSON.stringify({
        error: 'Missing server configuration',
        needed: ['GATEWAY_URL', 'GATEWAY_TOKEN']
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sessionKey = body.sessionKey || 'agent:main:main';
  const message = (body.message || '').trim();

  if (!message) {
    return new Response(JSON.stringify({ error: 'message required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const resp = await fetch(`${gatewayUrl}/v1/sessions/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${gatewayToken}`
    },
    body: JSON.stringify({ sessionKey, message })
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};

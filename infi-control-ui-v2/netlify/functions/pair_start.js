import { store } from './_store.js'

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(), 'Content-Type': 'application/json' } })
}

function randCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return Buffer.from(bytes).toString('base64url')
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: cors() })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const apiKey = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!apiKey) return json(401, { error: 'Missing API key (Authorization: Bearer ...)' })

  const code = randCode()
  const s = store()

  await s.set(`pair:${code}`, JSON.stringify({ apiKey, createdAt: Date.now() }), { ttl: 10 * 60 })

  return json(200, { ok: true, code, expiresSec: 600 })
}

import { store } from './_store.js'
import { encryptJson } from './_crypto.js'

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

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: cors() })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const apiKey = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!apiKey) return json(401, { error: 'Missing API key (Authorization: Bearer ...)' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON body' }) }

  const name = String(body.name || 'Gateway').trim()
  const baseUrl = String(body.baseUrl || '').replace(/\/$/, '')
  const token = String(body.token || '').trim()

  if (!baseUrl || !token) return json(400, { error: 'baseUrl and token required' })

  const serverSecret = process.env.INFI_SERVER_SECRET || ''
  const enc = await encryptJson(serverSecret, { name, baseUrl, token, createdAt: Date.now() })

  const s = store()
  await s.set(`pending:${apiKey}`, enc)

  return json(200, { ok: true })
}

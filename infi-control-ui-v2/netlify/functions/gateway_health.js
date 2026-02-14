import { store } from './_store.js'
import { decryptJson } from './_crypto.js'

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

  const connectionId = String(body.connectionId || '').trim()
  if (!connectionId) return json(400, { error: 'connectionId required' })

  const s = store()
  const idxRaw = (await s.get(`idx:${apiKey}`)) || '[]'
  let idx
  try { idx = JSON.parse(idxRaw) } catch { idx = [] }
  if (!Array.isArray(idx) || !idx.some(x => x && x.connectionId === connectionId)) {
    return json(403, { error: 'connection not authorized for this apiKey' })
  }

  const enc = await s.get(`conn:${connectionId}`)
  if (!enc) return json(404, { error: 'connection not found' })

  const serverSecret = process.env.INFI_SERVER_SECRET || ''
  const conn = await decryptJson(serverSecret, enc)
  const baseUrl = String(conn.baseUrl || '').replace(/\/$/, '')
  const token = String(conn.token || '')

  const resp = await fetch(`${baseUrl}/v1/status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })

  const text = await resp.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  return json(200, { ok: resp.ok, status: resp.status, data })
}

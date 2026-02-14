import { store } from './_store.js'
import { decryptJson, encryptJson } from './_crypto.js'

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

function id() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return Buffer.from(bytes).toString('base64url')
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: cors() })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const apiKey = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!apiKey) return json(401, { error: 'Missing API key (Authorization: Bearer ...)' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON body' }) }

  const code = String(body.code || '').trim()
  if (!code) return json(400, { error: 'code required' })

  const s = store()
  const pairRaw = await s.get(`pair:${code}`)
  if (!pairRaw) return json(404, { error: 'Pairing code not found/expired' })

  const pair = JSON.parse(pairRaw)
  const expected = String(pair.apiKey || '')
  if (!expected || expected !== apiKey) return json(403, { error: 'pairing code not valid for this apiKey' })

  const pending = await s.get(`pending:${apiKey}`)
  if (!pending) return json(409, { error: 'No gateway registered yet. Run the setup command on the gateway host first.' })

  const serverSecret = process.env.INFI_SERVER_SECRET || ''
  const gw = await decryptJson(serverSecret, pending)

  const connectionId = id()
  const encConn = await encryptJson(serverSecret, gw)
  await s.set(`conn:${connectionId}`, encConn)

  const idxKey = `idx:${apiKey}`
  const idxRaw = (await s.get(idxKey)) || '[]'
  let idx
  try { idx = JSON.parse(idxRaw) } catch { idx = [] }
  if (!Array.isArray(idx)) idx = []
  idx.unshift({ connectionId, name: gw.name, baseUrl: gw.baseUrl, createdAt: Date.now() })
  idx = idx.slice(0, 4)
  await s.set(idxKey, JSON.stringify(idx))

  await s.delete(`pending:${apiKey}`)
  await s.delete(`pair:${code}`)

  return json(200, { ok: true, connectionId, name: gw.name, baseUrl: gw.baseUrl })
}

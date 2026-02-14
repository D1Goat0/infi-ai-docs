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

function id() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return Buffer.from(bytes).toString('base64url')
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: cors() })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON body' }) }

  const code = String(body.code || '').trim()
  const baseUrl = String(body.baseUrl || '').replace(/\/$/, '')
  const token = String(body.token || '').trim()
  const name = String(body.name || 'Gateway').trim()

  if (!code || !baseUrl || !token) return json(400, { error: 'code, baseUrl, token required' })

  const s = store()
  const pairRaw = await s.get(`pair:${code}`)
  if (!pairRaw) return json(404, { error: 'Pairing code not found/expired' })

  const pair = JSON.parse(pairRaw)
  const apiKey = String(pair.apiKey || '')
  if (!apiKey) return json(500, { error: 'Bad pairing record' })

  const connectionId = id()
  const serverSecret = process.env.INFI_SERVER_SECRET || ''

  const enc = await encryptJson(serverSecret, {
    baseUrl,
    token,
    name,
    createdAt: Date.now(),
  })

  await s.set(`conn:${connectionId}`, enc)

  const indexKey = `idx:${apiKey}`
  const idxRaw = (await s.get(indexKey)) || '[]'
  let idx
  try { idx = JSON.parse(idxRaw) } catch { idx = [] }
  if (!Array.isArray(idx)) idx = []
  idx.unshift({ connectionId, name, baseUrl, createdAt: Date.now() })
  idx = idx.slice(0, 4)
  await s.set(indexKey, JSON.stringify(idx))

  await s.delete(`pair:${code}`)

  return json(200, {
    ok: true,
    connectionId,
    name,
    baseUrl,
  })
}

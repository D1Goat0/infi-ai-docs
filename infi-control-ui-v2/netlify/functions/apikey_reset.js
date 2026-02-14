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

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: cors() })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const apiKey = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!apiKey) return json(401, { error: 'Missing API key (Authorization: Bearer ...)' })

  const s = store()

  const idxKey = `idx:${apiKey}`
  const idxRaw = (await s.get(idxKey)) || '[]'
  let idx
  try { idx = JSON.parse(idxRaw) } catch { idx = [] }
  if (!Array.isArray(idx)) idx = []

  for (const item of idx) {
    const id = item?.connectionId
    if (id) await s.delete(`conn:${id}`)
  }

  await s.delete(idxKey)
  await s.delete(`pending:${apiKey}`)

  return json(200, { ok: true })
}

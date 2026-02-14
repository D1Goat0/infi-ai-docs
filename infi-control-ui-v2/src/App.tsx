import { useMemo, useState } from 'react'
import './index.css'

type GatewayConn = {
  id: string
  name: string
  baseUrl: string
  token: string
}

function loadConns(): GatewayConn[] {
  try {
    const raw = localStorage.getItem('infi.v2.gateways')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveConns(conns: GatewayConn[]) {
  localStorage.setItem('infi.v2.gateways', JSON.stringify(conns))
}

async function healthcheck(baseUrl: string, token: string) {
  const url = `/api/gateway/health`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, token }),
  })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, data }
}

export default function App() {
  const [tab, setTab] = useState<'chat' | 'gateways' | 'agents' | 'plugins' | 'bindings' | 'keys' | 'audit' | 'settings'>('chat')
  const [conns, setConns] = useState<GatewayConn[]>(() => loadConns())
  const [activeId, setActiveId] = useState<string>(() => conns[0]?.id || '')
  const active = useMemo(() => conns.find(c => c.id === activeId) || conns[0] || null, [conns, activeId])

  function upsertConn(conn: GatewayConn) {
    const next = [...conns]
    const idx = next.findIndex(c => c.id === conn.id)
    if (idx >= 0) next[idx] = conn
    else next.push(conn)
    setConns(next)
    saveConns(next)
    if (!activeId) setActiveId(conn.id)
  }

  function deleteConn(id: string) {
    const next = conns.filter(c => c.id !== id)
    setConns(next)
    saveConns(next)
    if (activeId === id) setActiveId(next[0]?.id || '')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100%' }}>
      <aside style={{ padding: 16, borderRight: '1px solid var(--border)' }}>
        <div className="card" style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ fontWeight: 700, letterSpacing: 0.6 }}>INFI CONTROL</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>v2 — OpenClaw theme • Infiltra brand</div>
            </div>
            <div className="badge">4 gateways</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Active gateway</div>
            <select className="input" value={active?.id || ''} onChange={e => setActiveId(e.target.value)}>
              {conns.length === 0 ? <option value="">(none)</option> : null}
              {conns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }} className="mono">
              {active ? active.baseUrl : 'Add a gateway to begin'}
            </div>
          </div>
        </div>

        <Nav tab={tab} setTab={setTab} />
      </aside>

      <main style={{ padding: 18 }}>
        {tab === 'gateways' ? (
          <Gateways conns={conns} upsert={upsertConn} del={deleteConn} onHealth={healthcheck} />
        ) : tab === 'chat' ? (
          <Chat active={active} />
        ) : (
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Coming soon</div>
            <div style={{ color: 'var(--muted)' }}>
              {tab} — will ship in milestones (agents, tasks/collab, ClawHub, bindings generator, keys, audit).
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Nav({ tab, setTab }: { tab: string, setTab: (t: any) => void }) {
  const items: { id: any, label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'gateways', label: 'Gateways' },
    { id: 'agents', label: 'Agents' },
    { id: 'plugins', label: 'Plugins (ClawHub)' },
    { id: 'bindings', label: 'Bindings' },
    { id: 'keys', label: 'Keys / Secrets' },
    { id: 'audit', label: 'Audit' },
    { id: 'settings', label: 'Settings' },
  ]
  return (
    <div className="card" style={{ padding: 10 }}>
      {items.map(it => (
        <button
          key={it.id}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'left',
            marginBottom: 8,
            borderColor: tab === it.id ? 'rgba(0,255,138,0.35)' : 'var(--border)',
            background: tab === it.id ? 'rgba(0,255,138,0.10)' : 'rgba(10, 16, 30, 0.45)',
          }}
          onClick={() => setTab(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

function Gateways({
  conns,
  upsert,
  del,
  onHealth,
}: {
  conns: GatewayConn[]
  upsert: (c: GatewayConn) => void
  del: (id: string) => void
  onHealth: (baseUrl: string, token: string) => Promise<any>
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:18789')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<string>('')

  async function test() {
    setStatus('Testing...')
    try {
      const r = await onHealth(baseUrl, token)
      setStatus(r.ok ? `OK (${r.status})` : `FAIL (${r.status})`)
    } catch (e: any) {
      setStatus(`FAIL (${e?.message || 'error'})`)
    }
  }

  function add() {
    const id = crypto.randomUUID()
    upsert({ id, name: name || `Gateway ${conns.length + 1}`, baseUrl, token })
    setName('')
    setToken('')
    setStatus('Saved.')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800 }}>Gateway connections</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>Add up to 4. v1 stores locally; milestone will move to encrypted server storage.</div>
          </div>
          <div className="badge">{conns.length}/4</div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Name</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="CM5-main" />
          </label>
          <label>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Base URL (http)</div>
            <input className="input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://gateway.example.com" />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              Must be reachable from the website. If it’s local-only, use Tailscale Serve/Funnel or a reverse proxy.
            </div>
          </label>
          <label>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Gateway token</div>
            <input className="input mono" value={token} onChange={e => setToken(e.target.value)} placeholder="paste token" />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Write-only soon; for now it is stored in this browser.</div>
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={test}>Test</button>
            <button className="btn btn-primary" onClick={add} disabled={conns.length >= 4}>Save</button>
            <div style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 12 }}>{status}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Existing</div>
        {conns.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>No connections yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {conns.map(c => (
              <div key={c.id} className="card" style={{ padding: 12, background: 'rgba(9, 14, 26, 0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{c.baseUrl}</div>
                  </div>
                  <button className="btn" onClick={() => del(c.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Chat({ active }: { active: GatewayConn | null }) {
  const [text, setText] = useState('')
  const [out, setOut] = useState<string>('')

  async function send() {
    if (!active) {
      setOut('No active gateway. Add one first.')
      return
    }
    setOut('Sending...')
    const resp = await fetch('/api/gateway/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: active.baseUrl, token: active.token, sessionKey: 'agent:main:main', message: text }),
    })
    const data = await resp.json().catch(() => ({}))
    setOut(JSON.stringify(data, null, 2))
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800 }}>Chat</div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>MVP proxy to gateway session send. Timeline/streaming lands next.</div>
        </div>
        <div className="badge">{active ? active.name : 'No gateway'}</div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <textarea
          className="input"
          style={{ minHeight: 120, resize: 'vertical' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Send a message to agent:main:main"
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={send}>Send</button>
          <button className="btn" onClick={() => { setText(''); setOut('') }}>Clear</button>
        </div>
        <pre className="card mono" style={{ padding: 12, background: 'rgba(9, 14, 26, 0.6)', overflow: 'auto', maxHeight: 320 }}>{out}</pre>
      </div>
    </div>
  )
}

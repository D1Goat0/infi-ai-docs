import { useMemo, useState } from 'react'
import './index.css'

type Tab = 'dashboard' | 'chat' | 'gateways' | 'agents' | 'plugins' | 'bindings' | 'keys' | 'audit' | 'settings'

type GatewayConn = {
  id: string
  name: string
  baseUrl: string
  token: string
}

const LS_CONNS = 'infi.v2.gateways'
const LS_ONBOARDED = 'infi.v2.onboarded'

function loadConns(): GatewayConn[] {
  try {
    const raw = localStorage.getItem(LS_CONNS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveConns(conns: GatewayConn[]) {
  localStorage.setItem(LS_CONNS, JSON.stringify(conns))
}

function loadOnboarded() {
  return localStorage.getItem(LS_ONBOARDED) === '1'
}

function setOnboarded() {
  localStorage.setItem(LS_ONBOARDED, '1')
}

async function postJson(url: string, body: any) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, data }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [conns, setConns] = useState<GatewayConn[]>(() => loadConns())
  const [activeId, setActiveId] = useState<string>(() => conns[0]?.id || '')
  const active = useMemo(() => conns.find(c => c.id === activeId) || conns[0] || null, [conns, activeId])
  const [onboarded, setOnboardedState] = useState<boolean>(() => loadOnboarded())

  function upsertConn(conn: GatewayConn) {
    const next = [...conns]
    const idx = next.findIndex(c => c.id === conn.id)
    if (idx >= 0) next[idx] = conn
    else next.push(conn)

    setConns(next)
    saveConns(next)
    if (!activeId) setActiveId(conn.id)

    if (!onboarded) {
      setOnboarded()
      setOnboardedState(true)
    }
  }

  function deleteConn(id: string) {
    const next = conns.filter(c => c.id !== id)
    setConns(next)
    saveConns(next)
    if (activeId === id) setActiveId(next[0]?.id || '')
  }

  const needsSetup = !onboarded || conns.length === 0

  if (needsSetup) {
    return (
      <Onboarding
        conns={conns}
        upsert={upsertConn}
        onFinish={() => {
          setOnboarded()
          setOnboardedState(true)
          setTab('dashboard')
        }}
      />
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%' }}>
      <aside style={{ padding: 18, borderRight: '1px solid rgba(205,228,255,0.10)' }}>
        <div className="glass" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div className="h1 brand">INFI CONTROL</div>
              <div className="sub">Liquid glass • OpenClaw-style • Infiltra command center</div>
            </div>
            <div className="badge">{Math.min(conns.length, 4)}/4 gateways</div>
          </div>

          <div className="hr" style={{ margin: '12px 0' }} />

          <div>
            <div className="sub" style={{ marginBottom: 6 }}>Active gateway</div>
            <select className="input" value={active?.id || ''} onChange={e => setActiveId(e.target.value)}>
              {conns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="sub mono" style={{ marginTop: 8, opacity: 0.85 }}>
              {active ? active.baseUrl : ''}
            </div>
          </div>
        </div>

        <Nav tab={tab} setTab={setTab} />

        <div className="glass-soft" style={{ padding: 14, marginTop: 14 }}>
          <div className="sub" style={{ marginBottom: 8 }}>Quick actions</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <button className="btn" onClick={() => setTab('chat')}>Open Chat</button>
            <button className="btn" onClick={() => setTab('gateways')}>Manage Gateways</button>
          </div>
        </div>
      </aside>

      <main style={{ padding: 22 }}>
        {tab === 'dashboard' ? (
          <Dashboard active={active} conns={conns} />
        ) : tab === 'gateways' ? (
          <Gateways conns={conns} upsert={upsertConn} del={deleteConn} />
        ) : tab === 'chat' ? (
          <Chat active={active} />
        ) : (
          <ComingSoon tab={tab} />
        )}
      </main>
    </div>
  )
}

function Nav({ tab, setTab }: { tab: Tab, setTab: (t: Tab) => void }) {
  const items: { id: Tab, label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'Chat' },
    { id: 'gateways', label: 'Gateways' },
    { id: 'agents', label: 'Agents' },
    { id: 'plugins', label: 'Plugins' },
    { id: 'bindings', label: 'Bindings' },
    { id: 'keys', label: 'Keys / Secrets' },
    { id: 'audit', label: 'Audit' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="glass-soft" style={{ padding: 10 }}>
      {items.map(it => {
        const active = tab === it.id
        return (
          <button
            key={it.id}
            className="btn"
            style={{
              width: '100%',
              textAlign: 'left',
              marginBottom: 8,
              borderColor: active ? 'rgba(39,255,177,0.35)' : 'rgba(205,228,255,0.14)',
              background: active
                ? 'linear-gradient(180deg, rgba(39,255,177,0.18), rgba(39,255,177,0.08))'
                : 'rgba(10, 14, 28, 0.24)',
            }}
            onClick={() => setTab(it.id)}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

function Dashboard({ active, conns }: { active: GatewayConn | null, conns: GatewayConn[] }) {
  const [health, setHealth] = useState<string>('')

  async function check() {
    if (!active) return
    setHealth('Checking...')
    const r = await postJson('/api/gateway/health', { baseUrl: active.baseUrl, token: active.token })
    setHealth(r.ok ? `Healthy (${r.status})` : `Unhealthy (${r.status})`)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div className="h1">Command Center</div>
            <div className="sub">Your control layer for 4 gateways, tasks, plugins, and routing.</div>
          </div>
          <div className="badge">Active: <span className="mono" style={{ color: 'var(--text)' }}>{active?.name || 'none'}</span></div>
        </div>

        <div className="hr" style={{ margin: '14px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }}>
          <div className="glass-soft" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Gateway status</div>
                <div className="sub mono">{active?.baseUrl || ''}</div>
              </div>
              <button className="btn btn-primary" onClick={check}>Healthcheck</button>
            </div>
            <div className="sub" style={{ marginTop: 10 }}>{health || 'Run a healthcheck to verify auth + reachability.'}</div>
          </div>

          <div className="glass-soft" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Connected gateways</div>
            <div className="sub" style={{ marginBottom: 10 }}>Up to 4. (Pairing code flow ships next.)</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {conns.slice(0, 4).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div className="sub mono">{c.baseUrl}</div>
                  </div>
                  <div className="badge">ready</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <Kpi title="Tasks" value="Soon" note="Fan-out + results" />
        <Kpi title="Bindings" value="Soon" note="Routing generator" />
        <Kpi title="Audit" value="Soon" note="Redacted tool events" />
      </div>
    </div>
  )
}

function Kpi({ title, value, note }: { title: string, value: string, note: string }) {
  return (
    <div className="glass-soft" style={{ padding: 16 }}>
      <div className="sub" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
      <div className="sub" style={{ marginTop: 6 }}>{note}</div>
    </div>
  )
}

function Gateways({
  conns,
  upsert,
  del,
}: {
  conns: GatewayConn[]
  upsert: (c: GatewayConn) => void
  del: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:18789')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<string>('')

  async function test() {
    setStatus('Testing...')
    try {
      const r = await postJson('/api/gateway/health', { baseUrl, token })
      setStatus(r.ok ? `OK (${r.status})` : `FAIL (${r.status})`)
    } catch (e: any) {
      setStatus(`FAIL (${e?.message || 'error'})`)
    }
  }

  function add() {
    if (conns.length >= 4) {
      setStatus('Limit reached (4). Remove one to add another.')
      return
    }
    const id = crypto.randomUUID()
    upsert({ id, name: name || `Gateway ${conns.length + 1}`, baseUrl, token })
    setName('')
    setToken('')
    setStatus('Saved.')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="glass" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="h1">Gateways</div>
            <div className="sub">Manage up to 4 connections. (Tokenless pairing flow ships next milestone.)</div>
          </div>
          <div className="badge">{conns.length}/4</div>
        </div>

        <div className="hr" style={{ margin: '14px 0' }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="sub" style={{ marginBottom: 6 }}>Name</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="CM5-main" />
          </label>
          <label>
            <div className="sub" style={{ marginBottom: 6 }}>Base URL</div>
            <input className="input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://gateway.example.com" />
          </label>
          <label>
            <div className="sub" style={{ marginBottom: 6 }}>Gateway token</div>
            <input className="input mono" value={token} onChange={e => setToken(e.target.value)} placeholder="paste token" />
          </label>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn" onClick={test}>Test</button>
            <button className="btn btn-primary" onClick={add}>Save</button>
            <div className="sub">{status}</div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 18 }}>
        <div className="h1" style={{ marginBottom: 10 }}>Existing</div>
        {conns.length === 0 ? (
          <div className="sub">No connections yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {conns.map(c => (
              <div key={c.id} className="glass-soft" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                    <div className="sub mono">{c.baseUrl}</div>
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
    const r = await postJson('/api/gateway/send', {
      baseUrl: active.baseUrl,
      token: active.token,
      sessionKey: 'agent:main:main',
      message: text,
    })
    setOut(JSON.stringify(r, null, 2))
  }

  return (
    <div className="glass" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div className="h1">Chat</div>
          <div className="sub">Proxy message send to the selected gateway session. Timeline + streaming next.</div>
        </div>
        <div className="badge">{active ? active.name : 'No gateway'}</div>
      </div>

      <div className="hr" style={{ margin: '14px 0' }} />

      <div style={{ display: 'grid', gap: 10 }}>
        <textarea
          className="input"
          style={{ minHeight: 140, resize: 'vertical' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Send a message to agent:main:main"
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={send}>Send</button>
          <button className="btn" onClick={() => { setText(''); setOut('') }}>Clear</button>
        </div>
        <pre className="glass-soft mono" style={{ padding: 14, overflow: 'auto', maxHeight: 320, margin: 0 }}>{out}</pre>
      </div>
    </div>
  )
}

function ComingSoon({ tab }: { tab: Tab }) {
  return (
    <div className="glass" style={{ padding: 18 }}>
      <div className="h1">Coming soon</div>
      <div className="sub" style={{ marginTop: 8 }}>
        {tab} ships as focused milestones: pairing + tasks/collab, plugin catalog, bindings generator, keys, and audit.
      </div>
    </div>
  )
}

function Onboarding({
  conns,
  upsert,
  onFinish,
}: {
  conns: GatewayConn[]
  upsert: (c: GatewayConn) => void
  onFinish: () => void
}) {
  const [name, setName] = useState('CM5-main')
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:18789')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('')

  async function test() {
    setStatus('Testing...')
    const r = await postJson('/api/gateway/health', { baseUrl, token })
    setStatus(r.ok ? `OK (${r.status})` : `FAIL (${r.status})`)
  }

  function saveAndEnter() {
    const id = crypto.randomUUID()
    upsert({ id, name: name || `Gateway ${conns.length + 1}`, baseUrl, token })
    onFinish()
  }

  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 22 }}>
      <div style={{ width: 'min(980px, 100%)', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
        <div className="glass" style={{ padding: 24 }}>
          <div className="h1 brand" style={{ fontSize: 26 }}>Welcome to INFI CONTROL</div>
          <div className="sub" style={{ marginTop: 10, lineHeight: 1.6 }}>
            Before you get a dashboard, we pair your first gateway.
            Next milestone removes token pasting with a pairing-code flow.
          </div>

          <div className="hr" style={{ margin: '16px 0' }} />

          <div style={{ display: 'grid', gap: 10 }}>
            <label>
              <div className="sub" style={{ marginBottom: 6 }}>Gateway name</div>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              <div className="sub" style={{ marginBottom: 6 }}>Gateway base URL</div>
              <input className="input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
              <div className="sub" style={{ marginTop: 8 }}>
                If this gateway is local-only, the site won’t reach it until we ship the pairing relay.
              </div>
            </label>
            <label>
              <div className="sub" style={{ marginBottom: 6 }}>Gateway token</div>
              <input className="input mono" value={token} onChange={e => setToken(e.target.value)} placeholder="paste token" />
            </label>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              <button className="btn" onClick={test}>Test connection</button>
              <button className="btn btn-primary" onClick={saveAndEnter}>Enter dashboard</button>
              <div className="sub">{status}</div>
            </div>
          </div>
        </div>

        <div className="glass-soft" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>What you get</div>
          <div className="sub" style={{ marginTop: 10, lineHeight: 1.7 }}>
            • Liquid-glass command center UI<br />
            • 4 gateway slots<br />
            • Chat + healthcheck now<br />
            • Tasks/collab + pairing code next
          </div>

          <div className="hr" style={{ margin: '14px 0' }} />

          <div className="sub" style={{ lineHeight: 1.7 }}>
            Design goal: high-end, clean, "queen" UI — minimal clutter, strong hierarchy, glass depth.
          </div>
        </div>
      </div>
    </div>
  )
}

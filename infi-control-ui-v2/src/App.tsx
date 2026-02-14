import { useEffect, useMemo, useState } from 'react'
import './index.css'

type Tab = 'dashboard' | 'chat' | 'gateways' | 'agents' | 'plugins' | 'bindings' | 'keys' | 'audit' | 'settings'

type Connection = {
  connectionId: string
  name: string
  baseUrl: string
  createdAt: number
}

const LS_APIKEY = 'infi.v2.apiKey'
const LS_ACTIVE = 'infi.v2.activeConnectionId'

function getApiKey() {
  try { return localStorage.getItem(LS_APIKEY) || '' } catch { return '' }
}

function setApiKey(v: string) {
  localStorage.setItem(LS_APIKEY, v)
}

function getActiveId() {
  try { return localStorage.getItem(LS_ACTIVE) || '' } catch { return '' }
}

function setActiveId(v: string) {
  localStorage.setItem(LS_ACTIVE, v)
}

function b64url(bytes: Uint8Array) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  const b64 = btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return b64
}

function genKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return `infi_${b64url(bytes)}`
}

async function authed(apiKey: string, url: string, init: RequestInit) {
  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Bearer ${apiKey}`)
  return fetch(url, { ...init, headers })
}

async function authedJson(apiKey: string, url: string, init: { method?: string, body?: any }) {
  const resp = await authed(apiKey, url, {
    method: init.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, data }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey())
  const [connections, setConnections] = useState<Connection[]>([])
  const [activeConnectionId, setActiveConnectionIdState] = useState<string>(() => getActiveId())

  const active = useMemo(() => connections.find(c => c.connectionId === activeConnectionId) || connections[0] || null, [connections, activeConnectionId])

  useEffect(() => {
    if (!apiKey) return
    let cancelled = false
    ;(async () => {
      const resp = await authed(apiKey, '/api/connections/list', { method: 'GET' })
      const data = await resp.json().catch(() => ({}))
      if (cancelled) return
      if (data?.connections && Array.isArray(data.connections)) {
        setConnections(data.connections)
        const existing = getActiveId()
        const fallback = data.connections[0]?.connectionId || ''
        if (!existing && fallback) {
          setActiveId(fallback)
          setActiveConnectionIdState(fallback)
        }
      }
    })()
    return () => { cancelled = true }
  }, [apiKey])

  const needsSetup = !apiKey || connections.length === 0

  if (needsSetup) {
    return (
      <Onboarding
        apiKey={apiKey}
        setApiKey={(k) => {
          setApiKey(k)
          setApiKeyState(k)
        }}
        onPaired={async () => {
          const resp = await authed(apiKey || getApiKey(), '/api/connections/list', { method: 'GET' })
          const data = await resp.json().catch(() => ({}))
          if (data?.connections && Array.isArray(data.connections)) {
            setConnections(data.connections)
            const first = data.connections[0]?.connectionId || ''
            if (first) {
              setActiveId(first)
              setActiveConnectionIdState(first)
            }
          }
        }}
      />
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: '100%' }}>
      <aside style={{ padding: 18, borderRight: '1px solid rgba(205,228,255,0.10)' }}>
        <div className="glass" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div className="h1 brand">INFI CONTROL</div>
              <div className="sub">Liquid glass • command center</div>
            </div>
            <div className="badge">{Math.min(connections.length, 4)}/4</div>
          </div>

          <div className="hr" style={{ margin: '12px 0' }} />

          <div>
            <div className="sub" style={{ marginBottom: 6 }}>Active gateway</div>
            <select
              className="input"
              value={active?.connectionId || ''}
              onChange={e => {
                const v = e.target.value
                setActiveId(v)
                setActiveConnectionIdState(v)
              }}
            >
              {connections.map(c => (
                <option key={c.connectionId} value={c.connectionId}>{c.name}</option>
              ))}
            </select>
            <div className="sub mono" style={{ marginTop: 8, opacity: 0.85 }}>
              {active ? active.baseUrl : ''}
            </div>
          </div>

          <div className="hr" style={{ margin: '12px 0' }} />

          <div className="sub">API key</div>
          <div className="sub mono" style={{ marginTop: 6, wordBreak: 'break-all' }}>{apiKey.slice(0, 8)}…{apiKey.slice(-6)}</div>
        </div>

        <Nav tab={tab} setTab={setTab} />

        <div className="glass-soft" style={{ padding: 14, marginTop: 14 }}>
          <div className="sub" style={{ marginBottom: 8 }}>Quick actions</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <button className="btn" onClick={() => setTab('chat')}>Open Chat</button>
            <button className="btn" onClick={() => setTab('gateways')}>Pair Gateway</button>
          </div>
        </div>
      </aside>

      <main style={{ padding: 22 }}>
        {tab === 'dashboard' ? (
          <Dashboard apiKey={apiKey} active={active} connections={connections} />
        ) : tab === 'gateways' ? (
          <Gateways apiKey={apiKey} onPaired={async () => {
            const resp = await authed(apiKey, '/api/connections/list', { method: 'GET' })
            const data = await resp.json().catch(() => ({}))
            if (data?.connections && Array.isArray(data.connections)) setConnections(data.connections)
          }} />
        ) : tab === 'chat' ? (
          <Chat apiKey={apiKey} active={active} />
        ) : tab === 'settings' ? (
          <Settings apiKey={apiKey} />
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
    { id: 'gateways', label: 'Gateways (Pairing)' },
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

function Dashboard({ apiKey, active, connections }: { apiKey: string, active: Connection | null, connections: Connection[] }) {
  const [health, setHealth] = useState<string>('')

  async function check() {
    if (!active) return
    setHealth('Checking...')
    const r = await authedJson(apiKey, '/api/gateway/health', {
      body: { connectionId: active.connectionId },
    })
    setHealth(r.ok ? `Healthy (${r.status})` : `Unhealthy (${r.status})`)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div className="h1">Command Center</div>
            <div className="sub">Pair gateways using a one-time code. No tokens in the browser.</div>
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
            <div className="sub" style={{ marginBottom: 10 }}>Up to 4 connections per API key.</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {connections.slice(0, 4).map(c => (
                <div key={c.connectionId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
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
        <Kpi title="Tasks" value="Next" note="Fan-out + results" />
        <Kpi title="Bindings" value="Next" note="Routing generator" />
        <Kpi title="Audit" value="Next" note="Redacted tool events" />
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

function Gateways({ apiKey, onPaired }: { apiKey: string, onPaired: () => Promise<void> }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')

  async function start() {
    setStatus('Generating code...')
    const r = await authedJson(apiKey, '/api/pair/start', {})
    if (!r.ok) {
      setStatus(`Failed (${r.status})`)
      return
    }
    setCode(String(r.data.code || ''))
    setStatus('Code generated. Tell Infi “pair” in Telegram to get a code, then paste it here.')
  }

  async function finish() {
    setStatus('Finishing pair...')
    const r = await authedJson(apiKey, '/api/pair/finish', { body: { code } })
    if (!r.ok) {
      setStatus(String(r.data?.error || `Failed (${r.status})`))
      return
    }
    setStatus(`Paired: ${r.data?.name || 'gateway'}`)
    await onPaired()
  }

  return (
    <div className="glass" style={{ padding: 18 }}>
      <div>
        <div className="h1">Gateway Pairing</div>
        <div className="sub">Simple flow: register API key on the gateway host once, then paste pairing codes here.</div>
      </div>

      <div className="hr" style={{ margin: '14px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="glass-soft" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Step A — Generate code</div>
          <div className="sub" style={{ lineHeight: 1.7 }}>
            Click generate, then ask Infi in Telegram: <span className="mono">pair</span>.
            Infi will respond with a pairing code.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={start}>Generate pairing code</button>
            <div className="sub">{status}</div>
          </div>

          {code ? (
            <div style={{ marginTop: 12 }}>
              <div className="sub" style={{ marginBottom: 6 }}>Pairing code</div>
              <input className="input mono" value={code} onChange={e => setCode(e.target.value)} />
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={finish} disabled={!code}>Finish pairing</button>
          </div>
        </div>

        <div className="glass-soft" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Step B — One-time gateway setup command</div>
          <div className="sub" style={{ lineHeight: 1.7 }}>
            Run this once on the gateway host so Infi can securely store the gateway connection.
            This is where the gateway token is used — not in the browser.
          </div>
          <div className="hr" style={{ margin: '12px 0' }} />
          <div className="sub" style={{ marginBottom: 8 }}>Command</div>
          <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{
`curl -sS -X POST ${window.location.origin}/api/apikey/register \\
  -H 'authorization: Bearer ${apiKey}' \\
  -H 'content-type: application/json' \\
  -d '{"name":"CM5-main","baseUrl":"http://127.0.0.1:18789","token":"<GATEWAY_TOKEN>"}'`
          }</pre>
          <div className="sub" style={{ marginTop: 10 }}>
            After running it, generate a pairing code and finish pairing.
          </div>
        </div>
      </div>
    </div>
  )
}

function Chat({ apiKey, active }: { apiKey: string, active: Connection | null }) {
  const [text, setText] = useState('')
  const [out, setOut] = useState<string>('')

  async function send() {
    if (!active) {
      setOut('No active gateway.')
      return
    }
    setOut('Sending...')
    const r = await authedJson(apiKey, '/api/gateway/send', {
      body: { connectionId: active.connectionId, sessionKey: 'agent:main:main', message: text },
    })
    setOut(JSON.stringify(r, null, 2))
  }

  return (
    <div className="glass" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div className="h1">Chat</div>
          <div className="sub">Send messages through your API key → server-side connection → gateway.</div>
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
        {tab} ships as focused milestones: tasks/collab, plugin catalog, bindings generator, keys, and audit.
      </div>
    </div>
  )
}

function Settings({ apiKey }: { apiKey: string }) {
  const [status, setStatus] = useState('')

  function restartLocal() {
    localStorage.removeItem('infi.v2.activeConnectionId')
    localStorage.removeItem('infi.v2.lastPairCode')
    setStatus('Restarted locally. Reloading...')
    setTimeout(() => window.location.reload(), 300)
  }

  async function deleteInstance() {
    const ok = window.confirm('Delete this instance? This will remove all paired gateways for this API key and restart onboarding.')
    if (!ok) return

    setStatus('Deleting instance...')

    const resp = await authedJson(apiKey, '/api/apikey/reset', { body: {} })
    if (!resp.ok) {
      setStatus(String(resp.data?.error || `Failed (${resp.status})`))
      return
    }

    localStorage.removeItem('infi.v2.apiKey')
    localStorage.removeItem('infi.v2.activeConnectionId')
    localStorage.removeItem('infi.v2.lastPairCode')

    setStatus('Deleted. Reloading...')
    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <div className="glass" style={{ padding: 18 }}>
      <div className="h1">Settings</div>
      <div className="sub" style={{ marginTop: 8 }}>Restart and delete controls for this Control UI instance.</div>

      <div className="hr" style={{ margin: '14px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="glass-soft" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Restart (local)</div>
          <div className="sub" style={{ lineHeight: 1.7 }}>
            Clears local UI state and reloads. Does not delete paired gateways on the server.
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={restartLocal}>Restart UI</button>
          </div>
        </div>

        <div className="glass-soft" style={{ padding: 16, borderColor: 'rgba(255,122,217,0.20)' }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Danger zone</div>
          <div className="sub" style={{ lineHeight: 1.7 }}>
            Deletes all paired gateways for your API key and restarts onboarding.
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" style={{ borderColor: 'rgba(255,122,217,0.28)' }} onClick={deleteInstance}>Delete instance</button>
          </div>
        </div>
      </div>

      <div className="sub" style={{ marginTop: 12 }}>{status}</div>
    </div>
  )
}

function Onboarding({
  apiKey,
  setApiKey,
  onPaired,
}: {
  apiKey: string
  setApiKey: (k: string) => void
  onPaired: () => Promise<void>
}) {
  const initialKey = apiKey || genKey()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [localKey, setLocalKey] = useState(initialKey)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!apiKey) setApiKey(initialKey)
  }, [])

  async function startPair() {
    setStatus('Generating pairing code...')
    const r = await authedJson(localKey, '/api/pair/start', {})
    if (!r.ok) {
      setStatus(`Failed (${r.status})`)
      return
    }
    const code = String(r.data.code || '')
    localStorage.setItem('infi.v2.lastPairCode', code)
    setStatus('Pairing code generated. Go to Step 3.')
    setStep(3)
  }

  const code = (() => {
    try { return localStorage.getItem('infi.v2.lastPairCode') || '' } catch { return '' }
  })()

  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: 'min(1100px, 100%)' }}>
        <div className="glass" style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <div>
              <div className="h1 brand" style={{ fontSize: 28 }}>INFI CONTROL — Setup</div>
              <div className="sub" style={{ marginTop: 8, lineHeight: 1.6 }}>
                Full onboarding: generate an API key, then pair gateways with a one-time code.
                This removes gateway tokens from the browser.
              </div>
            </div>
            <div className="badge">liquid glass</div>
          </div>

          <div className="hr" style={{ margin: '16px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="glass-soft" style={{ padding: 18 }}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Step {step} / 3</div>

              {step === 1 ? (
                <>
                  <div className="sub" style={{ lineHeight: 1.7 }}>
                    Your INFI API key was auto-generated. Copy it and keep it safe — anyone with it can use your paired gateways.
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="sub" style={{ marginBottom: 6 }}>API key</div>
                    <input className="input mono" value={localKey} onChange={e => setLocalKey(e.target.value)} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button className="btn" onClick={() => navigator.clipboard.writeText(localKey)}>Copy</button>
                      <button
                        className="btn"
                        onClick={() => {
                          const k = genKey()
                          setLocalKey(k)
                          setApiKey(k)
                        }}
                      >
                        Rotate key
                      </button>
                      <button className="btn btn-primary" onClick={() => { setApiKey(localKey); setStep(2) }}>Continue</button>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="sub" style={{ lineHeight: 1.7 }}>
                    Generate a pairing code. You will claim it from the gateway host.
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button className="btn btn-primary" onClick={startPair}>Generate pairing code</button>
                    <button className="btn" onClick={() => setStep(1)}>Back</button>
                  </div>
                  <div className="sub" style={{ marginTop: 10 }}>{status}</div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="sub" style={{ lineHeight: 1.7 }}>
                    Run this on the gateway host (where OpenClaw runs). Replace baseUrl/token/name.
                  </div>
                  <div className="hr" style={{ margin: '12px 0' }} />
                  <div className="sub" style={{ marginBottom: 8 }}>Pairing code</div>
                  <div className="mono" style={{ fontWeight: 900 }}>{code || '(missing code — go back and generate one)'} </div>
                  <div className="sub" style={{ marginTop: 12, marginBottom: 6 }}>Command</div>
                  <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`curl -sS -X POST ${window.location.origin}/api/pair/claim \\
  -H 'content-type: application/json' \\
  -d '{"code":"${code}","name":"CM5-main","baseUrl":"http://127.0.0.1:18789","token":"<GATEWAY_TOKEN>"}'`}
                  </pre>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        await onPaired()
                      }}
                    >
                      I ran it — refresh connections
                    </button>
                    <button className="btn" onClick={() => setStep(2)}>Back</button>
                  </div>
                </>
              ) : null}
            </div>

            <div className="glass-soft" style={{ padding: 18 }}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>What this solves</div>
              <div className="sub" style={{ lineHeight: 1.75 }}>
                • The browser never stores gateway tokens<br />
                • Pairing codes expire quickly (10 minutes)<br />
                • API key gates access to your connections<br />
                • Next milestone: tasks/collab + multi-gateway orchestration
              </div>

              <div className="hr" style={{ margin: '14px 0' }} />
              <div className="sub" style={{ lineHeight: 1.75 }}>
                This is the start of the “parent key → derived key” model you asked for.
              </div>
            </div>
          </div>
        </div>

        <div className="sub" style={{ marginTop: 10, textAlign: 'center' }}>
          If the UI looks unchanged, hard refresh (Ctrl+Shift+R) — Netlify can cache aggressively.
        </div>
      </div>
    </div>
  )
}

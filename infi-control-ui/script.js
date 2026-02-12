const tabs = [
  ['dashboard', 'Dashboard'],
  ['chat', 'Chat'],
  ['accounts', 'Accounts'],
  ['plugins', 'Plugins'],
  ['moltbook', 'Moltbook'],
  ['system', 'System']
];

const pluginCatalog = [
  { name: 'Discord', desc: 'Community + suggestions + announcements' },
  { name: 'GitHub', desc: 'Repo monitoring and coding workflows' },
  { name: 'Netlify', desc: 'Site deploy + uptime operations' },
  { name: 'Brave Search', desc: 'Web research and intelligence' },
  { name: 'Moltbook', desc: 'Knowledge/task notebook integration' }
];

const $ = (id) => document.getElementById(id);
const store = {
  get: (k, d = null) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

function initTabs() {
  const root = $('tabs');
  root.innerHTML = '';
  tabs.forEach(([id, label], idx) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = idx === 0 ? 'active' : '';
    b.onclick = () => showTab(id, b, label);
    root.appendChild(b);
  });
}

function showTab(id, btn, label) {
  document.querySelectorAll('#tabs button').forEach((x) => x.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelector(`.view[data-view="${id}"]`).classList.add('active');
  $('viewTitle').textContent = label;
}

function renderQuickStatus() {
  const accounts = store.get('accounts', []);
  const plugins = store.get('installedPlugins', []);
  $('quickStatus').innerHTML = `
    <li>Connected accounts: <b>${accounts.length}</b></li>
    <li>Installed plugins: <b>${plugins.length}</b></li>
    <li>Console status: <b>Ready</b></li>
  `;
}

$('checkSite').onclick = async () => {
  const url = $('siteUrl').value.trim();
  $('siteResult').textContent = 'Checking...';
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    $('siteResult').textContent = `Likely up — ${new Date().toLocaleTimeString()}`;
  } catch {
    $('siteResult').textContent = `Check failed — ${new Date().toLocaleTimeString()}`;
  }
};

function renderAccounts() {
  const accounts = store.get('accounts', []);
  $('accountsList').innerHTML = accounts.length ? '' : '<p class="muted">No accounts saved yet.</p>';
  accounts.forEach((a) => {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `<b>${a.service}</b><br><span class="muted">${a.masked}</span>`;
    $('accountsList').appendChild(el);
  });
}

$('saveAccount').onclick = () => {
  const service = $('acctService').value;
  const token = $('acctToken').value.trim();
  if (!token) return;
  const accounts = store.get('accounts', []);
  const masked = `${token.slice(0, 4)}...${token.slice(-4)}`;
  const next = accounts.filter((a) => a.service !== service).concat([{ service, token, masked }]);
  store.set('accounts', next);
  $('acctToken').value = '';
  renderAccounts();
  renderQuickStatus();
};

function renderPlugins() {
  $('pluginCatalog').innerHTML = '';
  const installed = store.get('installedPlugins', []);
  pluginCatalog.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const isInstalled = installed.includes(p.name);
    row.innerHTML = `<b>${p.name}</b><br><span class="muted">${p.desc}</span>`;
    const btn = document.createElement('button');
    btn.textContent = isInstalled ? 'Installed' : 'Install';
    btn.style.marginTop = '.45rem';
    btn.disabled = isInstalled;
    btn.onclick = () => {
      store.set('installedPlugins', [...installed, p.name]);
      renderPlugins();
      renderQuickStatus();
    };
    row.appendChild(document.createElement('br'));
    row.appendChild(btn);
    $('pluginCatalog').appendChild(row);
  });

  $('installedPlugins').innerHTML = '';
  if (!installed.length) {
    $('installedPlugins').innerHTML = '<p class="muted">No plugins installed yet.</p>';
    return;
  }
  installed.forEach((name) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.textContent = name;
    $('installedPlugins').appendChild(row);
  });
}

$('saveMolt').onclick = () => {
  store.set('moltbook', {
    url: $('moltUrl').value,
    key: $('moltKey').value,
    notes: $('moltNotes').value
  });
  alert('Moltbook config saved locally.');
};

function loadMolt() {
  const m = store.get('moltbook', { url: '', key: '', notes: '' });
  $('moltUrl').value = m.url;
  $('moltKey').value = m.key;
  $('moltNotes').value = m.notes;
}

$('sendChat').onclick = async () => {
  const gatewayUrl = $('gatewayUrl').value.trim();
  const message = $('chatInput').value.trim();
  if (!message) return;
  const sessionKey = $('sessionKey').value.trim() || 'agent:main:main';

  if (!gatewayUrl) {
    $('chatLog').textContent += `You: ${message}\nInfi AI: Gateway not configured yet.\n\n`;
    $('chatInput').value = '';
    return;
  }

  $('chatLog').textContent += `You: ${message}\n`;
  try {
    const res = await fetch(`${gatewayUrl.replace(/\/$/, '')}/v1/sessions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey, message })
    });
    const data = await res.json();
    $('chatLog').textContent += `Infi AI: ${JSON.stringify(data)}\n\n`;
  } catch (e) {
    $('chatLog').textContent += `Infi AI: Request failed (${e.message})\n\n`;
  }
  $('chatInput').value = '';
};

function renderSubbots() {
  const bots = store.get('subbots', []);
  $('subbotList').innerHTML = bots.length ? '' : '<p class="muted">No sub bots added yet.</p>';
  bots.forEach((b) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.textContent = b;
    $('subbotList').appendChild(row);
  });
}

$('addSubbot').onclick = () => {
  const name = $('subbotName').value.trim();
  if (!name) return;
  const bots = store.get('subbots', []);
  if (!bots.includes(name)) bots.push(name);
  store.set('subbots', bots);
  $('subbotName').value = '';
  renderSubbots();
};

async function loadSystemSpecs() {
  try {
    const res = await fetch('system.json', { cache: 'no-store' });
    const data = await res.json();
    $('systemSpecs').textContent = JSON.stringify(data, null, 2);
  } catch {
    $('systemSpecs').textContent = 'Could not load system specs.';
  }
}

initTabs();
renderQuickStatus();
renderAccounts();
renderPlugins();
loadMolt();
renderSubbots();
loadSystemSpecs();

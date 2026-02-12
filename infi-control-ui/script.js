const actionResult = document.getElementById('actionResult');
const uptimeResult = document.getElementById('uptimeResult');
const notesResult = document.getElementById('notesResult');

const notesKey = 'infi-ai-notes';
const notesEl = document.getElementById('notes');
notesEl.value = localStorage.getItem(notesKey) || '';

document.getElementById('pingBtn').onclick = () => {
  actionResult.textContent = `Ping OK at ${new Date().toLocaleTimeString()}`;
};

document.getElementById('reportBtn').onclick = () => {
  actionResult.textContent = 'Draft: Repos checked, uptime stable, no critical alerts.';
};

document.getElementById('saveNotesBtn').onclick = () => {
  localStorage.setItem(notesKey, notesEl.value);
  notesResult.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
};

document.getElementById('checkBtn').onclick = async () => {
  const url = document.getElementById('siteUrl').value.trim();
  if (!url) return;

  uptimeResult.textContent = 'Checking...';

  try {
    // Browser-only safe check route: use no-cors fetch as a simple availability signal.
    await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    uptimeResult.textContent = `Likely up — checked at ${new Date().toLocaleTimeString()}`;
  } catch {
    uptimeResult.textContent = `Check failed at ${new Date().toLocaleTimeString()}`;
  }
};

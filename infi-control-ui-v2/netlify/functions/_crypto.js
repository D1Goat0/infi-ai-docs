const enc = new TextEncoder();
const dec = new TextDecoder();

function b64uEncode(bytes) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function b64uDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

async function keyFromSecret(secret) {
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptJson(secret, obj) {
  if (!secret) throw new Error('Missing INFI_SERVER_SECRET');
  const key = await keyFromSecret(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = enc.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return `${b64uEncode(iv)}.${b64uEncode(new Uint8Array(ciphertext))}`;
}

export async function decryptJson(secret, payload) {
  if (!secret) throw new Error('Missing INFI_SERVER_SECRET');
  const [ivB64u, ctB64u] = String(payload || '').split('.');
  if (!ivB64u || !ctB64u) throw new Error('Bad payload');
  const key = await keyFromSecret(secret);
  const iv = b64uDecode(ivB64u);
  const ct = b64uDecode(ctB64u);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(dec.decode(new Uint8Array(plaintext)));
}

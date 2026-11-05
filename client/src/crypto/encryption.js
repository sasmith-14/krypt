
const ITERATIONS = 200_000;
const KEY_LENGTH  = 256;

function str2buf(str)  { return new TextEncoder().encode(str); }
function buf2str(buf)  { return new TextDecoder().decode(buf); }
function buf2b64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b642buf(b64)  {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

export async function deriveKey(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort().join('_');
  const salt      = [userId2, userId1].sort().join('-');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    str2buf(sortedIds),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name:       'PBKDF2',
      salt:       str2buf(salt),
      iterations: ITERATIONS,
      hash:       'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

export async function encrypt(plaintext, key) {
  const iv         = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf  = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    str2buf(plaintext)
  );

  return `${buf2b64(iv.buffer)}.${buf2b64(cipherBuf)}`;
}

export async function decrypt(ciphertext, key) {
  const [ivB64, dataB64] = ciphertext.split('.');
  if (!ivB64 || !dataB64) throw new Error('Malformed ciphertext');

  const iv        = new Uint8Array(b642buf(ivB64));
  const cipherBuf = b642buf(dataB64);

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBuf
  );

  return buf2str(plainBuf);
}

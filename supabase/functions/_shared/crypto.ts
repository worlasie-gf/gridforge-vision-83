// AES-GCM helpers for encrypting OAuth tokens at rest.
// TOKEN_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).

function getKeyBytes(): Uint8Array {
  const hex = Deno.env.get("TOKEN_ENCRYPTION_KEY") ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("TOKEN_ENCRYPTION_KEY is not configured");
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", getKeyBytes(), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)),
  );
  return `${toB64(iv)}.${toB64(cipher)}`;
}

export async function decryptSecret(payload: string): Promise<string> {
  const [ivB64, cipherB64] = payload.split(".");
  const key = await getKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(cipherB64),
  );
  return new TextDecoder().decode(plain);
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed session token.
 * Output format: username|expiry|signatureHex
 */
export async function createSession(username: string, secret: string, durationMs = 7 * 24 * 60 * 60 * 1000): Promise<string> {
  const expiry = Date.now() + durationMs;
  const data = `${username}|${expiry}`;
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `${data}|${signatureHex}`;
}

/**
 * Verifies a session token and returns the username if valid.
 */
export async function verifySession(token: string | null, secret: string): Promise<string | null> {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  
  const [username, expiryStr, signatureHex] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || expiry < Date.now()) return null;
  
  const data = `${username}|${expiryStr}`;
  const key = await getCryptoKey(secret);
  
  try {
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(data));
    return isValid ? username : null;
  } catch {
    return null;
  }
}

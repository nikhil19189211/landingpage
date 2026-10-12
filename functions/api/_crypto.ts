/**
 * Shared Web Crypto helper for signed upgrade tokens
 * Runs in Cloudflare Workers / Pages Functions runtime.
 */

export interface TokenPayload {
  issuedAt: number;
  expiresAt: number;
  starterProductId: string;
}

// Convert ArrayBuffer to Hex String
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Import secret key for HMAC-SHA256
async function getCryptoKey(secretKey: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Sign token
export async function signUpgradeToken(payload: TokenPayload, secretKey: string): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const key = await getCryptoKey(secretKey);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
  const hexSignature = bufferToHex(signatureBuffer);
  const base64Payload = btoa(payloadStr);
  return `${base64Payload}.${hexSignature}`;
}

// Verify token
export async function verifyUpgradeToken(
  tokenString: string,
  secretKey: string
): Promise<{ valid: boolean; payload?: TokenPayload; remainingSeconds?: number; reason?: string }> {
  try {
    if (!tokenString || !tokenString.includes('.')) {
      return { valid: false, reason: 'Malformed token' };
    }

    const [base64Payload, hexSignature] = tokenString.split('.');
    const payloadStr = atob(base64Payload);
    const payload = JSON.parse(payloadStr) as TokenPayload;

    const encoder = new TextEncoder();
    const key = await getCryptoKey(secretKey);
    const expectedSigBytes = hexToBuffer(hexSignature);

    const isSigValid = await crypto.subtle.verify(
      'HMAC',
      key,
      expectedSigBytes,
      encoder.encode(payloadStr)
    );

    if (!isSigValid) {
      return { valid: false, reason: 'Invalid signature' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.expiresAt) {
      return { valid: false, reason: 'Offer expired' };
    }

    return {
      valid: true,
      payload,
      remainingSeconds: Math.max(0, payload.expiresAt - now)
    };
  } catch (err: any) {
    return { valid: false, reason: err?.message || 'Verification error' };
  }
}

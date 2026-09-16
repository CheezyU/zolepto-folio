// RFC 6238 Time-Based One-Time Password (TOTP) implementation
// Uses the standard browser Web Cryptography API (window.crypto.subtle)
// Compatible with Google Authenticator, Authy, Apple Passwords, 1Password

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodes a Base32 string into Uint8Array
 */
export function base32ToBytes(base32: string): Uint8Array {
  const cleaned = base32.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Encodes a Uint8Array into Base32 string
 */
export function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generates a fresh random Base32 secret for TOTP setup
 */
export function generateTotpSecret(length = 20): string {
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  return bytesToBase32(randomBytes).slice(0, 16);
}

/**
 * Generates 5 one-time emergency backup codes
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const num = Math.floor(100000 + Math.random() * 900000);
    codes.push(`ZLP-${num}`);
  }
  return codes;
}

/**
 * Calculates a 6-digit TOTP code for a secret and counter step
 */
export async function generateTotpCode(secretBase32: string, timeStepWindow = 0): Promise<string> {
  const secretBytes = base32ToBytes(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepWindow;

  // Convert counter to 8-byte big-endian buffer
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(0, 0, false);
  counterView.setUint32(4, timeStep, false);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const signatureBytes = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = signatureBytes[signatureBytes.length - 1] & 0x0f;
  const binary =
    ((signatureBytes[offset] & 0x7f) << 24) |
    ((signatureBytes[offset + 1] & 0xff) << 16) |
    ((signatureBytes[offset + 2] & 0xff) << 8) |
    (signatureBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit code against the secret key (allows +/- 1 step for clock drift)
 */
export async function verifyTotpCode(secretBase32: string, userCode: string): Promise<boolean> {
  const cleaned = userCode.trim().replace(/\s+/g, '');
  if (cleaned.length !== 6 || !/^\d{6}$/.test(cleaned)) {
    return false;
  }

  // Check current window, previous window, next window
  for (let windowOffset = -1; windowOffset <= 1; windowOffset++) {
    try {
      const expected = await generateTotpCode(secretBase32, windowOffset);
      if (expected === cleaned) {
        return true;
      }
    } catch {
      // Continue to next window
    }
  }
  return false;
}

/**
 * Returns the remaining seconds in the current 30-second TOTP window
 */
export function getTotpRemainingSeconds(): number {
  const epoch = Math.floor(Date.now() / 1000);
  return 30 - (epoch % 30);
}

/**
 * Builds standard otpauth URI for QR code generation
 */
export function buildOtpAuthUri(secret: string, email = 'zelopte@gmail.com', issuer = 'Zolepto Studio'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

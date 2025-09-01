import crypto from 'crypto';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getKey(): Buffer {
  const secret = requireEnv('ENCRYPTION_KEY');
  // Derive a 32-byte key using scrypt; stable salt string is fine for per-app key
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encrypt(plainText: string): string {
  const algorithm = 'aes-256-cbc';
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const algorithm = 'aes-256-cbc';
  const key = getKey();
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts.shift() as string, 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function ensureCryptoReady() {
  // Throws if not set
  requireEnv('ENCRYPTION_KEY');
}

// Legacy migration helpers removed to enforce single encryption secret (ENCRYPTION_KEY)

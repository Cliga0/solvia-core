/**
 * Branded string type placeholder for plaintext strings.
 * TODO: Replace with Solvia's own secret-encryption branded types.
 */
export type PlaintextString = string & { __plaintext: true };

/**
 * Placeholder for Twenty's isEncryptedString utility.
 * TODO: Replace with Solvia's own secret-encryption implementation.
 */
export function isEncryptedString(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('enc:');
}

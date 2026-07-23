import { Injectable } from '@nestjs/common';

import type { PlaintextString } from './secret-encryption';

/**
 * Placeholder for Twenty's SecretEncryptionService.
 * Minimal pass-through implementation — does NOT encrypt.
 * TODO: Replace with Solvia's own secret-encryption service.
 */
@Injectable()
export class SecretEncryptionService {
  encryptVersioned(plaintext: PlaintextString): string {
    return plaintext as unknown as string;
  }

  decryptVersionedOrThrow(encrypted: string): PlaintextString {
    return encrypted as unknown as PlaintextString;
  }
}

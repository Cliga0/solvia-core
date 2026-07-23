import { Module } from '@nestjs/common';

import { SecretEncryptionService } from './secret-encryption.service';

/**
 * Placeholder for Twenty's SecretEncryptionModule.
 * TODO: Replace with Solvia's own secret-encryption module.
 */
@Module({
  providers: [SecretEncryptionService],
  exports: [SecretEncryptionService],
})
export class SecretEncryptionModule {}

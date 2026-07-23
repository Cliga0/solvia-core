import type { MessageDescriptor } from './lingui-core';

/**
 * Placeholder for Twenty's CustomException base class.
 * Minimal implementation preserving the same constructor signature.
 * TODO: Replace with Solvia's own exception base class.
 */
export abstract class CustomException<TCode = string> extends Error {
  readonly code: TCode;
  readonly userFriendlyMessage?: MessageDescriptor;

  constructor(
    message: string,
    code: TCode,
    options?: { userFriendlyMessage?: MessageDescriptor },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.userFriendlyMessage = options?.userFriendlyMessage;
  }
}

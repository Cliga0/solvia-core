/**
 * Placeholder for @lingui/core MessageDescriptor type.
 * TODO: Replace with Solvia's own i18n solution.
 */
export interface MessageDescriptor {
  id: string;
  message?: string;
  values?: Record<string, unknown>;
  formats?: Record<string, unknown>;
  comment?: string;
}

/* =============================================================================
 * Provider Contract
 * =============================================================================
 *
 * Minimal dependency provider capability understood by the Solvia Kernel.
 *
 * Providers represent runtime capabilities that can be registered,
 * resolved and injected by adapters.
 *
 * =============================================================================
 */

export interface ProviderContract {
  /**
   * Optional provider identity.
   */
  readonly id?: string;
}

/* =============================================================================
 * Provider Type
 * =============================================================================
 *
 * Kernel-level provider reference.
 *
 * A provider can be:
 *
 * - a provider descriptor
 * - a provider constructor
 *
 * Framework adapters are responsible for translating concrete
 * dependency injection models.
 *
 * =============================================================================
 */

export type ProviderType =
  | ProviderContract
  | (abstract new (...args: unknown[]) => ProviderContract);

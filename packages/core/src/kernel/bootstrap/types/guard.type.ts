/* =============================================================================
 * Guard Contract
 * =============================================================================
 *
 * Minimal authorization capability understood by the Solvia Kernel.
 *
 * Framework adapters are responsible for mapping their native guard model
 * to this contract.
 *
 * =============================================================================
 */

export interface GuardContract {
  /**
   * Determines whether execution can continue.
   */
  canActivate(context: unknown): boolean | Promise<boolean>;
}

/* =============================================================================
 * Guard Type
 * =============================================================================
 *
 * Kernel-level guard constructor reference.
 *
 * =============================================================================
 */

export type GuardType = abstract new (...args: unknown[]) => GuardContract;

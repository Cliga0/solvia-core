/* =============================================================================
 * Module Contract
 * =============================================================================
 *
 * Minimal module abstraction understood by the Solvia Kernel.
 *
 * A module represents a runtime composition boundary.
 *
 * Framework adapters are responsible for translating concrete module systems
 * into this contract.
 *
 * =============================================================================
 */

export interface ModuleContract {
  /**
   * Optional runtime identifier.
   */
  readonly id?: string;
}

/* =============================================================================
 * Module Type
 * =============================================================================
 *
 * Kernel-level module reference.
 *
 * A module can be:
 *
 * - a runtime module instance
 * - a module constructor
 *
 * Framework-specific representations are handled by adapters.
 *
 * =============================================================================
 */

export type ModuleType =
  | ModuleContract
  | (abstract new (...args: any[]) => unknown);

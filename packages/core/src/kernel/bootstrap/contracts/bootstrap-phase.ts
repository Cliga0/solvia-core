/* =============================================================================
 * Bootstrap Phase
 * =============================================================================
 *
 * Represents one immutable stage of the Kernel bootstrap lifecycle.
 *
 * A phase does not execute work.
 *
 * Execution is owned by BootstrapEngine and delegated to specialized engines.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Identify a bootstrap stage
 * • Define execution ordering
 * • Provide lifecycle visibility
 *
 * Examples:
 *
 * initialize
 * resolve-contributions
 * load-contributions
 * discovery
 * registry
 * pipeline
 * runtime
 *
 * =============================================================================
 */

export interface BootstrapPhase {
  /**
   * Unique phase identifier.
   *
   * Example:
   *
   * "discovery"
   */
  readonly name: string;

  /**
   * Execution ordering.
   *
   * Lower values execute first.
   */
  readonly order: number;

  readonly internal?: boolean;
}

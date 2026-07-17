import type { ContributionConstructor } from "../types/contribution-constructor.type";

/* =============================================================================
 * Contribution Definition
 * =============================================================================
 *
 * Immutable declaration of a Kernel contribution.
 *
 * A ContributionDefinition exists before runtime instantiation.
 *
 * It represents the blueprint used by the Kernel to:
 *
 * • validate contributions
 * • resolve dependencies
 * • determine loading order
 * • instantiate contribution objects
 *
 *
 * Lifecycle:
 *
 * Definition
 *      |
 *      v
 * Resolver
 *      |
 *      v
 * KernelContribution
 *      |
 *      v
 * ContributionRuntime
 *
 *
 * The definition never:
 *
 * • executes lifecycle hooks
 * • owns runtime state
 * • mutates contributions
 *
 * =============================================================================
 */

export interface ContributionDefinition {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  /**
   * Stable contribution identifier.
   *
   * Must be unique inside the Kernel.
   *
   * Example:
   *
   * database
   * metrics
   * cache
   */
  readonly name: string;

  /**
   * Optional semantic version.
   */
  readonly version?: string;

  /**
   * Human readable description.
   */
  readonly description?: string;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  /**
   * Runtime implementation constructor.
   *
   * Must be a concrete KernelContribution class.
   */
  readonly type: ContributionConstructor;

  /* ===========================================================================
   * Dependency Resolution
   * ========================================================================= */

  /**
   * Required contributions.
   *
   * These contributions must exist and be initialized before this one.
   */
  readonly dependencies?: readonly string[];

  /* ===========================================================================
   * Execution Ordering
   * ========================================================================= */

  /**
   * Loading priority.
   *
   * Lower values execute first.
   *
   * Used only when dependency constraints allow multiple valid orders.
   *
   */
  readonly priority?: number;

  /**
   * Explicit deterministic ordering.
   *
   * Lower values execute first.
   *
   * This does not replace dependencies.
   */
  readonly order?: number;

  /* ===========================================================================
   * Loading Strategy
   * ========================================================================= */

  /**
   * Indicates lazy loading capability.
   *
   * Lazy contributions are registered but not immediately activated.
   */
  readonly lazy?: boolean;

  /**
   * Optional isolated loading group.
   *
   * Useful for:
   *
   * • infrastructure
   * • plugins
   * • optional capabilities
   */
  readonly group?: string;

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  /**
   * Immutable definition metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • tooling
   * • discovery
   * • instrumentation
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

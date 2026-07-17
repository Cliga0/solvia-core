import type { ContributionContext } from "../contracts/contribution-context";
import type { ContributionRuntime } from "../runtime/contribution-runtime";

/* =============================================================================
 * Contribution Hooks
 * =============================================================================
 *
 * Lifecycle contract implemented by Kernel contributions.
 *
 * Contributions expose optional lifecycle reactions.
 *
 * The Kernel owns:
 *
 *  - execution order
 *  - dependency ordering
 *  - error handling
 *  - rollback
 *
 * Contributions only implement behavior.
 *
 * =============================================================================
 */

export interface ContributionHooks {
  /**
   * ---------------------------------------------------------------------------
   * Before contribution loading.
   *
   * Use cases:
   *
   * - validate configuration
   * - prepare internal state
   * - allocate lightweight resources
   *
   * ---------------------------------------------------------------------------
   */
  beforeLoad?(context: ContributionContext): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Load contribution resources.
   *
   * Use cases:
   *
   * - initialize services
   * - register internal objects
   *
   * ---------------------------------------------------------------------------
   */
  load?(context: ContributionContext): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * After loading completed.
   *
   * ---------------------------------------------------------------------------
   */
  afterLoad?(context: ContributionContext): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Before runtime activation.
   *
   * ---------------------------------------------------------------------------
   */
  beforeStart?(context: ContributionContext): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Activate contribution.
   *
   * Contribution becomes operational.
   *
   * ---------------------------------------------------------------------------
   */
  start?(runtime: ContributionRuntime): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Kernel is fully ready.
   *
   * Called after bootstrap completion.
   *
   * ---------------------------------------------------------------------------
   */
  ready?(runtime: ContributionRuntime): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Graceful stop.
   *
   * ---------------------------------------------------------------------------
   */
  stop?(runtime: ContributionRuntime): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Final cleanup.
   *
   * ---------------------------------------------------------------------------
   */
  destroy?(context: ContributionContext): Promise<void> | void;

  /**
   * ---------------------------------------------------------------------------
   * Error notification.
   *
   * Called when lifecycle execution fails.
   *
   * ---------------------------------------------------------------------------
   */
  error?(error: Error, context: ContributionContext): Promise<void> | void;
}

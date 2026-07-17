/* =============================================================================
 * Contribution Status
 * =============================================================================
 *
 * Lifecycle states of a single Kernel Contribution.
 *
 * A ContributionRuntime transitions through these states while managed by the
 * Contribution Lifecycle.
 *
 * Typical lifecycle:
 *
 * REGISTERED
 *      │
 *      ▼
 * LOADING
 *      │
 *      ▼
 * LOADED
 *      │
 *      ▼
 * STARTING
 *      │
 *      ▼
 * RUNNING
 *      │
 *      ▼
 * STOPPING
 *      │
 *      ▼
 * STOPPED
 *
 * Any state may transition to FAILED.
 *
 * =============================================================================
 */

export enum ContributionStatus {
  /**
   * Contribution registered inside the Kernel.
   */
  REGISTERED = "registered",

  /**
   * Loading lifecycle is executing.
   */
  LOADING = "loading",

  /**
   * Contribution successfully loaded.
   */
  LOADED = "loaded",

  /**
   * Startup lifecycle is executing.
   */
  STARTING = "starting",

  /**
   * Contribution is fully operational.
   */
  RUNNING = "running",

  /**
   * Shutdown lifecycle is executing.
   */
  STOPPING = "stopping",

  /**
   * Contribution has been stopped.
   */
  STOPPED = "stopped",

  /**
   * Contribution failed during its lifecycle.
   */
  FAILED = "failed",
}

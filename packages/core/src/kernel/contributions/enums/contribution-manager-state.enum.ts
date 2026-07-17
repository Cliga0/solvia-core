/* =============================================================================
 * Contribution Manager State
 * =============================================================================
 *
 * Global lifecycle states of the Contribution Manager.
 *
 * Unlike ContributionStatus, these states describe the runtime responsible for
 * orchestrating all Kernel contributions.
 *
 * Typical lifecycle:
 *
 * CREATED
 *      │
 *      ▼
 * REGISTERING
 *      │
 *      ▼
 * LOADING
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

export enum ContributionManagerState {
  /**
   * Manager created but not yet executing.
   */
  CREATED = "created",

  /**
   * Registering resolved contributions.
   */
  REGISTERING = "registering",

  /**
   * Executing contribution loading.
   */
  LOADING = "loading",

  /**
   * Starting registered contributions.
   */
  STARTING = "starting",

  /**
   * Contribution subsystem fully operational.
   */
  RUNNING = "running",

  /**
   * Gracefully stopping contributions.
   */
  STOPPING = "stopping",

  /**
   * Contribution subsystem stopped.
   */
  STOPPED = "stopped",

  /**
   * Manager execution failed.
   */
  FAILED = "failed",
}

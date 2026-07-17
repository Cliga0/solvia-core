import type { BootstrapExecutionMode } from "../enums/bootstrap-execution-mode.enum";

/* =============================================================================
 * Bootstrap Execution Options
 * =============================================================================
 *
 * Defines execution policies consumed by the Bootstrap Executor.
 *
 * BootstrapExecutionOptions controls HOW a BootstrapPlan is executed.
 *
 * It does NOT define:
 *
 * • bootstrap phases
 * • bootstrap actions
 * • execution plan structure
 * • runtime construction
 *
 * Responsibilities:
 *
 * • configure failure behavior
 * • configure execution strategy
 * • configure timing constraints
 * • configure observability
 *
 * =============================================================================
 */

export interface BootstrapExecutionOptions {
  /* ===========================================================================
   * Execution Strategy
   * ========================================================================= */

  /**
   * Execution strategy used by the Bootstrap Executor.
   *
   * Examples:
   *
   * SEQUENTIAL
   *   initialize
   *        |
   *   discovery
   *        |
   *   runtime
   *
   *
   * PARALLEL
   *   independent phases may execute concurrently.
   *
   */
  readonly mode?: BootstrapExecutionMode;

  /* ===========================================================================
   * Failure Policy
   * ========================================================================= */

  /**
   * Stop execution immediately when a phase fails.
   *
   * Recommended for production bootstrap.
   *
   */
  readonly failFast?: boolean;

  /**
   * Continue execution after a failed phase.
   *
   * Useful for:
   *
   * • diagnostics
   * • development tooling
   * • recovery scenarios
   *
   */
  readonly continueOnFailure?: boolean;

  /* ===========================================================================
   * Timeout Policy
   * ========================================================================= */

  /**
   * Maximum bootstrap execution duration.
   *
   * Undefined means unlimited execution time.
   *
   * milliseconds.
   */
  readonly timeout?: number;

  /**
   * Maximum execution duration allowed for a single phase.
   *
   * milliseconds.
   */
  readonly phaseTimeout?: number;

  /* ===========================================================================
   * Simulation
   * ========================================================================= */

  /**
   * Executes bootstrap in analysis mode.
   *
   * When enabled:
   *
   * • plan validation runs
   * • phases are inspected
   * • actions are not executed
   *
   */
  readonly dryRun?: boolean;

  /* ===========================================================================
   * Observability
   * ========================================================================= */

  /**
   * Enable lifecycle tracing.
   *
   * Records:
   *
   * • phase transitions
   * • execution order
   * • timing information
   *
   */
  readonly tracing?: boolean;

  /**
   * Enable execution profiling.
   *
   * Records performance metrics.
   */
  readonly profiling?: boolean;

  /**
   * Enable detailed diagnostic collection.
   */
  readonly diagnostics?: boolean;

  /* ===========================================================================
   * Extension Metadata
   * ========================================================================= */

  /**
   * Additional immutable execution metadata.
   *
   * Reserved for:
   *
   * • plugins
   * • instrumentation
   * • telemetry
   * • tooling
   *
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

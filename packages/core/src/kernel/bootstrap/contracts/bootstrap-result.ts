import type { BootstrapRuntime } from "./../runtime/contracts/bootstrap-runtime";

/* =============================================================================
 * Bootstrap Result
 * =============================================================================
 *
 * Immutable result produced by the Bootstrap Executor.
 *
 * A Bootstrap Result represents the outcome of the complete Kernel bootstrap
 * lifecycle.
 *
 * It encapsulates the produced runtime together with execution diagnostics.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Expose the produced Bootstrap Runtime
 * • Report bootstrap outcome
 * • Provide execution timings
 * • Capture bootstrap failures
 * • Expose immutable diagnostics
 *
 * It does NOT:
 *
 * • execute bootstrap phases
 * • mutate runtime state
 * • expose execution internals
 *
 * =============================================================================
 */

export interface BootstrapResult {
  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  /**
   * Bootstrap Runtime produced by a successful bootstrap.
   *
   * Undefined when bootstrap fails.
   */
  readonly runtime?: BootstrapRuntime;

  /* ===========================================================================
   * Outcome
   * ========================================================================= */

  /**
   * Indicates whether bootstrap completed successfully.
   */
  readonly success: boolean;

  /**
   * Failure captured during bootstrap execution.
   */
  readonly error?: Error;

  /* ===========================================================================
   * Timing
   * ========================================================================= */

  /**
   * Bootstrap start timestamp.
   */
  readonly startedAt: Date;

  /**
   * Bootstrap completion timestamp.
   */
  readonly completedAt: Date;

  /**
   * Total bootstrap duration in milliseconds.
   */
  readonly duration: number;

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Immutable execution metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • instrumentation
   * • telemetry
   * • profiling
   * • tracing
   * • developer tooling
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

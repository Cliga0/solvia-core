import type { BootstrapPhase } from "../../contracts/bootstrap-phase";

/* =============================================================================
 * Pipeline Result
 * =============================================================================
 *
 * Immutable execution report produced after pipeline completion.
 *
 * PipelineResult represents the final state of a bootstrap pipeline execution.
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Report execution success or failure
 * • Track executed phases
 * • Provide execution timing information
 * • Expose diagnostics metadata
 * • Support instrumentation and telemetry
 *
 *
 * Does NOT:
 *
 * • mutate pipeline state
 * • retry execution
 * • execute phases
 * • manage lifecycle
 *
 *
 * The PipelineExecutor owns creation of this object.
 *
 * =============================================================================
 *
 *
 * Lifecycle:
 *
 *
 * ExecutionPlan
 *        |
 *        v
 * PipelineExecutor
 *        |
 *        v
 * PipelineResult
 *
 *
 * =============================================================================
 */

export interface PipelineResult {
  /**
   * ---------------------------------------------------------------------------
   * Unique execution identifier.
   *
   * Allows correlation between:
   *
   * • logs
   * • metrics
   * • traces
   * • diagnostics
   *
   * ---------------------------------------------------------------------------
   */
  readonly id: string;

  /**
   * ---------------------------------------------------------------------------
   * Indicates whether the pipeline completed successfully.
   *
   * ---------------------------------------------------------------------------
   */
  readonly success: boolean;

  /**
   * ---------------------------------------------------------------------------
   * Ordered phases executed during this run.
   *
   * ---------------------------------------------------------------------------
   */
  readonly phases: readonly BootstrapPhase[];

  /**
   * ---------------------------------------------------------------------------
   * Number of executed phases.
   *
   * ---------------------------------------------------------------------------
   */
  readonly executed: number;

  /**
   * ---------------------------------------------------------------------------
   * Pipeline start timestamp.
   *
   * ---------------------------------------------------------------------------
   */
  readonly startedAt: Date;

  /**
   * ---------------------------------------------------------------------------
   * Pipeline completion timestamp.
   *
   * ---------------------------------------------------------------------------
   */
  readonly completedAt: Date;

  /**
   * ---------------------------------------------------------------------------
   * Total execution duration in milliseconds.
   *
   * ---------------------------------------------------------------------------
   */
  readonly duration: number;

  /**
   * ---------------------------------------------------------------------------
   * Captured failure.
   *
   * Undefined when execution succeeds.
   *
   * ---------------------------------------------------------------------------
   */
  readonly error?: Error;

  /**
   * ---------------------------------------------------------------------------
   * Execution diagnostics.
   *
   * Reserved for:
   *
   * • tracing
   * • profiling
   * • performance metrics
   * • debugging
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

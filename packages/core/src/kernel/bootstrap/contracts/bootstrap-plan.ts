import type { BootstrapPhase } from "./bootstrap-phase";
import type { BootstrapAction } from "./bootstrap-action";

/* =============================================================================
 * Bootstrap Plan
 * =============================================================================
 *
 * Immutable compiled representation of the Solvia Kernel bootstrap lifecycle.
 *
 * A BootstrapPlan is the output of the BootstrapBuilder.
 *
 * It represents the complete execution graph that will be validated and
 * executed by the BootstrapExecutor.
 *
 * The plan is a declarative artifact.
 *
 * It describes:
 *
 *  • what phases exist
 *  • their deterministic order
 *  • their executable handlers
 *  • their metadata
 *
 * It does NOT:
 *
 *  • execute phases
 *  • mutate context
 *  • manage lifecycle state
 *  • handle failures
 *
 * =============================================================================
 */

/* =============================================================================
 * Bootstrap Step
 * =============================================================================
 *
 * One executable unit of bootstrap.
 *
 * =============================================================================
 */

export interface BootstrapStep {
  /**
   * ---------------------------------------------------------------------------
   * Bootstrap phase descriptor.
   *
   * Defines where this step belongs in the lifecycle.
   * ---------------------------------------------------------------------------
   */
  readonly phase: BootstrapPhase;

  /**
   * ---------------------------------------------------------------------------
   * Executable bootstrap action.
   *
   * The BootstrapExecutor delegates execution to this action.
   *
   * The action owns the infrastructure logic associated with the phase.
   * ---------------------------------------------------------------------------
   */
  readonly action: BootstrapAction;

  /**
   * ---------------------------------------------------------------------------
   * Step execution dependencies.
   *
   * Reserved for future dependency graph validation.
   *
   * Example:
   *
   * [
   *   "resolve-contributions"
   * ]
   *
   * ---------------------------------------------------------------------------
   */
  readonly dependencies?: readonly string[];

  /**
   * ---------------------------------------------------------------------------
   * Step metadata.
   *
   * Used by:
   *
   * • telemetry
   * • profiling
   * • diagnostics
   * • developer tooling
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/* =============================================================================
 * Bootstrap Plan
 * =============================================================================
 *
 * Complete immutable bootstrap execution graph.
 *
 * =============================================================================
 */

export interface BootstrapPlan {
  /**
   * ---------------------------------------------------------------------------
   * Plan identity.
   *
   * ---------------------------------------------------------------------------
   */
  readonly id: string;

  /**
   * ---------------------------------------------------------------------------
   * Plan version.
   *
   * Allows future evolution of bootstrap contracts.
   *
   * ---------------------------------------------------------------------------
   */
  readonly version: number;

  /**
   * ---------------------------------------------------------------------------
   * Ordered execution steps.
   *
   * Ordering is deterministic and validated before execution.
   *
   * ---------------------------------------------------------------------------
   */
  readonly steps: readonly BootstrapStep[];

  /**
   * ---------------------------------------------------------------------------
   * Number of executable steps.
   *
   * ---------------------------------------------------------------------------
   */
  readonly count: number;

  /**
   * ---------------------------------------------------------------------------
   * Creation timestamp.
   *
   * ---------------------------------------------------------------------------
   */
  readonly createdAt: Date;

  /**
   * ---------------------------------------------------------------------------
   * Plan metadata.
   *
   * Reserved for:
   *
   * • environment
   * • profile
   * • feature flags
   * • instrumentation
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

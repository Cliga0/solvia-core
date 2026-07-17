import type { BootstrapRuntimeContext } from "../../runtime/contracts/bootstrap-runtime-context";

import type { ExecutionPlan } from "./execution-plan";
import type { PipelineResult } from "./pipeline-result";

/* =============================================================================
 * Bootstrap Pipeline
 * =============================================================================
 *
 * Public execution contract of the Solvia Kernel bootstrap pipeline.
 *
 * The pipeline is the runtime coordinator responsible for executing an already
 * prepared bootstrap execution plan.
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Receive validated execution plans
 * • Execute bootstrap phases deterministically
 * • Coordinate phase execution
 * • Produce execution reports
 *
 *
 * The pipeline does NOT:
 *
 * • discover phases
 * • create execution plans
 * • validate dependencies
 * • define bootstrap order
 * • perform infrastructure initialization
 *
 *
 * Those responsibilities belong respectively to:
 *
 * • PipelineBuilder
 * • PipelineValidator
 * • PhaseExecutor
 *
 *
 * Lifecycle:
 *
 *       ExecutionPlan
 *              |
 *              v
 *       BootstrapPipeline
 *              |
 *              v
 *       Phase Execution
 *              |
 *              v
 *       PipelineResult
 *
 * =============================================================================
 */

export interface BootstrapPipeline {
  /**
   * ---------------------------------------------------------------------------
   * Runtime context shared by every bootstrap phase.
   * ---------------------------------------------------------------------------
   */
  readonly context: BootstrapRuntimeContext;

  /**
   * ---------------------------------------------------------------------------
   * Execute a prepared bootstrap execution plan.
   *
   * The plan must already be:
   *
   * • built
   * • ordered
   * • validated
   *
   * ---------------------------------------------------------------------------
   */
  execute(plan: ExecutionPlan): Promise<PipelineResult>;
}

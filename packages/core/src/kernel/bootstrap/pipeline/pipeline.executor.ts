import { randomUUID } from "node:crypto";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPhase } from "../contracts/bootstrap-phase";

import type { ExecutionPlan } from "./contracts/execution-plan";
import type { PipelineResult } from "./contracts/pipeline-result";

import type { BootstrapActionRegistry } from "../actions/bootstrap-action.registry";

/* =============================================================================
 * Pipeline Executor
 * =============================================================================
 *
 * Executes immutable bootstrap execution plans.
 *
 * PipelineExecutor is the runtime driver of the bootstrap pipeline.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Execute ordered bootstrap phases
 * • Resolve actions through BootstrapActionRegistry
 * • Capture execution diagnostics
 * • Measure execution duration
 * • Produce immutable PipelineResult
 *
 *
 * Does NOT:
 *
 * • Build execution plans
 * • Validate execution plans
 * • Register actions
 * • Implement bootstrap logic
 *
 * =============================================================================
 */

export class PipelineExecutor {
  /**
   * Bootstrap action registry.
   */
  private readonly registry: BootstrapActionRegistry;

  /**
   * Constructor.
   */
  public constructor(registry: BootstrapActionRegistry) {
    this.registry = registry;
  }

  /* ===========================================================================
   * Execution
   * ========================================================================= */

  /**
   * Execute complete bootstrap pipeline.
   */
  public async execute(
    plan: ExecutionPlan,
    context: BootstrapRuntimeContext,
  ): Promise<PipelineResult> {
    const id = randomUUID();

    const startedAt = new Date();

    const executed: BootstrapPhase[] = [];

    try {
      for (const phase of plan.phases) {
        const action = this.registry.resolve(phase);

        await action.execute(context);

        executed.push(phase);
      }

      return this.createResult({
        id,
        success: true,
        phases: executed,
        startedAt,
      });
    } catch (error) {
      return this.createResult({
        id,
        success: false,
        phases: executed,
        startedAt,
        error,
      });
    }
  }

  /* ===========================================================================
   * Result
   * ========================================================================= */

  private createResult(options: {
    id: string;
    success: boolean;
    phases: readonly BootstrapPhase[];
    startedAt: Date;
    error?: unknown;
  }): PipelineResult {
    const completedAt = new Date();

    const phases = [...options.phases];

    return Object.freeze({
      id: options.id,

      success: options.success,

      phases: Object.freeze(phases),

      executed: phases.length,

      startedAt: options.startedAt,

      completedAt,

      duration: completedAt.getTime() - options.startedAt.getTime(),

      error:
        options.error instanceof Error
          ? options.error
          : options.error !== undefined
            ? new Error(String(options.error))
            : undefined,

      metadata: Object.freeze({
        executor: "pipeline-executor",
      }),
    });
  }
}

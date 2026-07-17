import type { BootstrapRuntimeContext } from "./runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPlan, BootstrapStep } from "./contracts/bootstrap-plan";

import type { BootstrapResult } from "./contracts/bootstrap-result";

import type { BootstrapExecutionOptions } from "./contracts/bootstrap-execution-options";

import { BootstrapExecutionMode } from "./enums/bootstrap-execution-mode.enum";

import { BootstrapValidator } from "./bootstrap.validator";

import { PhaseExecutor } from "./phase.executor";

/* =============================================================================
 * Bootstrap Executor
 * =============================================================================
 *
 * Runtime executor responsible for executing a validated BootstrapPlan.
 *
 * The executor transforms a declarative bootstrap graph into an execution
 * result.
 *
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate bootstrap plans
 * • Resolve execution strategy
 * • Execute bootstrap phases
 * • Coordinate PhaseExecutor
 * • Capture execution metrics
 * • Produce immutable BootstrapResult
 *
 *
 * Does NOT:
 *
 * • Build bootstrap plans
 * • Define bootstrap phases
 * • Implement infrastructure actions
 * • Build runtime objects
 *
 * =============================================================================
 */

export class BootstrapExecutor {
  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  private readonly phaseExecutor: PhaseExecutor;

  private readonly options: Readonly<BootstrapExecutionOptions>;

  /* ===========================================================================
   * Constructor
   * ========================================================================= */

  public constructor(
    private readonly context: BootstrapRuntimeContext,

    options: BootstrapExecutionOptions = {},
  ) {
    this.options = Object.freeze({
      ...options,
    });

    this.phaseExecutor = new PhaseExecutor(context);
  }

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Execute bootstrap lifecycle.
   */
  public async execute(plan: BootstrapPlan): Promise<BootstrapResult> {
    BootstrapValidator.validate(plan);

    const startedAt = new Date();

    const executed: BootstrapStep[] = [];

    try {
      if (!this.options.dryRun) {
        await this.executePlan(plan, executed);
      }

      return this.createSuccessResult(plan, executed, startedAt);
    } catch (error) {
      return this.createFailureResult(plan, executed, startedAt, error);
    }
  }

  /* ===========================================================================
   * Execution Strategy
   * ========================================================================= */

  private async executePlan(
    plan: BootstrapPlan,

    executed: BootstrapStep[],
  ): Promise<void> {
    const mode = this.options.mode ?? BootstrapExecutionMode.SEQUENTIAL;

    switch (mode) {
      case BootstrapExecutionMode.SEQUENTIAL:
        await this.executeSequential(plan.steps, executed);

        return;

      case BootstrapExecutionMode.PARALLEL:
        await this.executeParallel(plan.steps, executed);

        return;

      default:
        throw new Error(`Unsupported bootstrap execution mode "${mode}".`);
    }
  }

  /* ===========================================================================
   * Sequential Execution
   * ========================================================================= */

  private async executeSequential(
    steps: readonly BootstrapStep[],

    executed: BootstrapStep[],
  ): Promise<void> {
    for (const step of steps) {
      await this.executeStep(step);

      executed.push(step);
    }
  }

  /* ===========================================================================
   * Parallel Execution
   * ========================================================================= */

  private async executeParallel(
    steps: readonly BootstrapStep[],

    executed: BootstrapStep[],
  ): Promise<void> {
    await Promise.all(steps.map((step) => this.executeStep(step)));

    /*
     * Preserve plan ordering.
     *
     * Never push while promises execute.
     */
    executed.push(...steps);
  }

  /* ===========================================================================
   * Phase Execution
   * ========================================================================= */

  private async executeStep(step: BootstrapStep): Promise<void> {
    await this.phaseExecutor.execute(step.action);
  }

  /* ===========================================================================
   * Result Factory
   * ========================================================================= */

  private createSuccessResult(
    plan: BootstrapPlan,

    executed: readonly BootstrapStep[],

    startedAt: Date,
  ): BootstrapResult {
    const completedAt = new Date();

    return Object.freeze({
      runtime: this.context.runtime,

      success: true,

      startedAt,

      completedAt,

      duration: completedAt.getTime() - startedAt.getTime(),

      metadata: Object.freeze({
        planId: plan.id,

        version: plan.version,

        mode: this.options.mode ?? BootstrapExecutionMode.SEQUENTIAL,

        dryRun: this.options.dryRun ?? false,

        executed: executed.length,
      }),
    });
  }

  private createFailureResult(
    plan: BootstrapPlan,

    executed: readonly BootstrapStep[],

    startedAt: Date,

    error: unknown,
  ): BootstrapResult {
    const completedAt = new Date();

    return Object.freeze({
      success: false,

      error: error instanceof Error ? error : new Error(String(error)),

      startedAt,

      completedAt,

      duration: completedAt.getTime() - startedAt.getTime(),

      metadata: Object.freeze({
        planId: plan.id,

        version: plan.version,

        mode: this.options.mode ?? BootstrapExecutionMode.SEQUENTIAL,

        executed: executed.length,
      }),
    });
  }
}

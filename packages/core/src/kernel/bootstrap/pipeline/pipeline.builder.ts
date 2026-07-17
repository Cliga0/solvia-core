import type { BootstrapPhase } from "../contracts/bootstrap-phase";

import type { ExecutionPlan } from "./contracts/execution-plan";

/* =============================================================================
 * Pipeline Builder
 * =============================================================================
 *
 * Responsible for constructing immutable bootstrap execution plans.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Register bootstrap phases
 * • Sort execution order
 * • Produce immutable ExecutionPlan
 *
 * Does NOT:
 *
 * • execute phases
 * • resolve BootstrapAction implementations
 * • validate plans
 * • perform infrastructure work
 *
 * =============================================================================
 */

export class PipelineBuilder {
  /**
   * Registered phases.
   */
  private readonly phases: BootstrapPhase[] = [];

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  /**
   * Register one phase.
   */
  public addPhase(phase: BootstrapPhase): this {
    if (this.phases.some((item) => item.name === phase.name)) {
      throw new Error(`Pipeline phase already registered: ${phase.name}`);
    }

    this.phases.push(phase);

    return this;
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  /**
   * Build immutable execution plan.
   */
  public build(): ExecutionPlan {
    const ordered = [...this.phases].sort(this.compare).map((phase) =>
      Object.freeze({
        ...phase,
      }),
    );

    return Object.freeze({
      id: this.generateId(),

      phases: Object.freeze(ordered),

      size: ordered.length,

      createdAt: new Date(),

      metadata: Object.freeze({
        source: "pipeline-builder",

        phases: ordered.map((phase) => phase.name),
      }),
    });
  }

  /* ===========================================================================
   * Ordering
   * ========================================================================= */

  /**
   * Phase ordering strategy.
   */
  protected compare(left: BootstrapPhase, right: BootstrapPhase): number {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.name.localeCompare(right.name);
  }

  /* ===========================================================================
   * Helpers
   * ========================================================================= */

  protected generateId(): string {
    return `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

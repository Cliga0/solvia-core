import type { ExecutionPlan } from "./contracts/execution-plan";

/* =============================================================================
 * Pipeline Validator
 * =============================================================================
 *
 * Validates immutable bootstrap execution plans before execution.
 *
 * PipelineValidator is the last safety boundary before runtime execution.
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • validate execution plan integrity
 * • validate phase invariants
 * • guarantee deterministic ordering
 * • fail fast before execution
 *
 * Does NOT:
 *
 * • mutate plans
 * • execute phases
 * • resolve actions
 * • rebuild ordering
 *
 * =============================================================================
 */

export class PipelineValidator {
  /**
   * Validate complete execution plan.
   */
  public validate(plan: ExecutionPlan): void {
    this.validatePlanIdentity(plan);

    this.ensureNotEmpty(plan);

    this.validatePhases(plan);
  }

  /* ===========================================================================
   * Plan Validation
   * ========================================================================= */

  private validatePlanIdentity(plan: ExecutionPlan): void {
    if (!plan.id || plan.id.trim().length === 0) {
      throw new Error("Execution plan requires a valid identifier.");
    }

    if (!(plan.createdAt instanceof Date)) {
      throw new Error("Execution plan requires a valid creation timestamp.");
    }
  }

  private ensureNotEmpty(plan: ExecutionPlan): void {
    if (plan.size === 0 || plan.phases.length === 0) {
      throw new Error("Execution plan contains no executable phases.");
    }

    if (plan.size !== plan.phases.length) {
      throw new Error("Execution plan size does not match phase count.");
    }
  }

  /* ===========================================================================
   * Phase Validation
   * ========================================================================= */

  private validatePhases(plan: ExecutionPlan): void {
    const names = new Set<string>();

    const orders = new Set<number>();

    let previousOrder = -1;

    for (const phase of plan.phases) {
      this.validateName(phase.name, names);

      this.validateOrder(phase.name, phase.order, orders);

      this.validateSequence(phase.name, phase.order, previousOrder);

      previousOrder = phase.order;
    }
  }

  /* ===========================================================================
   * Invariants
   * ========================================================================= */

  private validateName(name: string, names: Set<string>): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Bootstrap phase requires a name.");
    }

    if (names.has(name)) {
      throw new Error(`Duplicate bootstrap phase "${name}".`);
    }

    names.add(name);
  }

  private validateOrder(
    name: string,
    order: number,
    orders: Set<number>,
  ): void {
    if (!Number.isInteger(order)) {
      throw new Error(
        `Bootstrap phase "${name}" has invalid order "${order}".`,
      );
    }

    if (order < 0) {
      throw new Error(`Bootstrap phase "${name}" has negative order.`);
    }

    if (orders.has(order)) {
      throw new Error(
        `Duplicate execution order "${order}" for phase "${name}".`,
      );
    }

    orders.add(order);
  }

  private validateSequence(
    name: string,
    current: number,
    previous: number,
  ): void {
    if (current < previous) {
      throw new Error(
        `Bootstrap phase "${name}" is not deterministically ordered.`,
      );
    }
  }
}

import type { BootstrapPlan, BootstrapStep } from "./contracts/bootstrap-plan";

/* =============================================================================
 * Bootstrap Validator
 * =============================================================================
 *
 * Safety boundary between:
 *
 *        Bootstrap Planning
 *              |
 *              v
 *        Bootstrap Execution
 *
 *
 * Responsibilities:
 *
 * • validate plan integrity
 * • validate step consistency
 * • validate phase graph ordering
 * • validate execution readiness
 *
 *
 * Does NOT:
 *
 * • mutate plans
 * • execute phases
 * • repair invalid configuration
 *
 * =============================================================================
 */

export class BootstrapValidator {
  /**
   * ---------------------------------------------------------------------------
   * Validate complete bootstrap plan.
   * ---------------------------------------------------------------------------
   */
  public static validate(plan: BootstrapPlan): void {
    this.validatePlan(plan);

    this.validateIdentity(plan);

    this.validateSteps(plan);

    this.validateOrdering(plan);

    this.validateDuplicates(plan);

    this.validateDependencies(plan);

    this.validateMetadata(plan);
  }

  /* ===========================================================================
   * Plan Integrity
   * ========================================================================= */

  private static validatePlan(plan: BootstrapPlan): void {
    if (!plan) {
      throw new Error("Bootstrap plan is required.");
    }

    if (!Array.isArray(plan.steps)) {
      throw new Error("Bootstrap plan steps must be an array.");
    }

    if (plan.count !== plan.steps.length) {
      throw new Error("Bootstrap plan count mismatch.");
    }
  }

  /* ===========================================================================
   * Identity
   * ========================================================================= */

  private static validateIdentity(plan: BootstrapPlan): void {
    if (!plan.id || !plan.id.trim()) {
      throw new Error("Bootstrap plan requires an identifier.");
    }

    if (typeof plan.version !== "number" || plan.version <= 0) {
      throw new Error("Bootstrap plan version is invalid.");
    }

    if (!(plan.createdAt instanceof Date)) {
      throw new Error("Bootstrap plan creation date is invalid.");
    }

    if (Number.isNaN(plan.createdAt.getTime())) {
      throw new Error("Bootstrap plan creation date is corrupted.");
    }
  }

  /* ===========================================================================
   * Steps
   * ========================================================================= */

  private static validateSteps(plan: BootstrapPlan): void {
    if (plan.steps.length === 0) {
      throw new Error("Bootstrap plan cannot contain zero steps.");
    }

    for (const step of plan.steps) {
      this.validateStep(step);
    }
  }

  private static validateStep(step: BootstrapStep): void {
    if (!step.phase) {
      throw new Error("Bootstrap step requires a phase.");
    }

    if (!step.action) {
      throw new Error(
        `Bootstrap phase "${step.phase.name}" has no associated action.`,
      );
    }

    if (step.action.phase.name !== step.phase.name) {
      throw new Error(
        `Bootstrap action phase mismatch for "${step.phase.name}".`,
      );
    }

    if (step.action.phase.order !== step.phase.order) {
      throw new Error(
        `Bootstrap action order mismatch for "${step.phase.name}".`,
      );
    }

    if (typeof step.action.execute !== "function") {
      throw new Error(
        `Bootstrap action "${step.phase.name}" must implement execute().`,
      );
    }
  }

  /* ===========================================================================
   * Ordering
   * ========================================================================= */

  private static validateOrdering(plan: BootstrapPlan): void {
    let previous = -Infinity;

    for (const step of plan.steps) {
      if (step.phase.order < previous) {
        throw new Error("Bootstrap phases are not ordered deterministically.");
      }

      previous = step.phase.order;
    }
  }

  /* ===========================================================================
   * Duplicate Detection
   * ========================================================================= */

  private static validateDuplicates(plan: BootstrapPlan): void {
    const phases = new Set<string>();

    for (const step of plan.steps) {
      const name = step.phase.name;

      if (phases.has(name)) {
        throw new Error(`Duplicate bootstrap phase detected: "${name}".`);
      }

      phases.add(name);
    }
  }

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  private static validateDependencies(plan: BootstrapPlan): void {
    const registered = new Set(plan.steps.map((step) => step.phase.name));

    for (const step of plan.steps) {
      for (const dependency of step.dependencies ?? []) {
        if (!registered.has(dependency)) {
          throw new Error(
            `Bootstrap phase "${step.phase.name}" depends on missing phase "${dependency}".`,
          );
        }
      }
    }
  }

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  private static validateMetadata(plan: BootstrapPlan): void {
    if (plan.metadata && typeof plan.metadata !== "object") {
      throw new Error("Bootstrap metadata must be an object.");
    }
  }
}

import { randomUUID } from "node:crypto";

import type { BootstrapAction } from "./contracts/bootstrap-action";

import type { BootstrapPlan, BootstrapStep } from "./contracts/bootstrap-plan";

/* =============================================================================
 * Bootstrap Builder
 * =============================================================================
 *
 * Builds the immutable bootstrap execution graph.
 *
 * The Builder defines WHAT the Kernel bootstrap lifecycle contains.
 *
 * It transforms registered BootstrapActions into a deterministic execution plan.
 *
 *
 * Architecture:
 *
 *
 * BootstrapAction
 *        |
 *        v
 * BootstrapBuilder
 *        |
 *        v
 * BootstrapPlan
 *        |
 *        v
 * BootstrapExecutor
 *
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Register bootstrap actions
 * • Associate phases with actions
 * • Preserve deterministic ordering
 * • Prevent duplicate phases
 * • Produce immutable BootstrapPlan
 *
 *
 * Does NOT:
 *
 * • Execute actions
 * • Manage runtime state
 * • Resolve dependencies
 * • Handle failures
 *
 * =============================================================================
 */

export class BootstrapBuilder {
  private readonly steps = new Map<string, BootstrapStep>();

  private readonly metadata: Record<string, unknown> = {
    source: "kernel",
  };

  private constructor(
    private readonly id: string,
    private readonly version: number,
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    options: {
      readonly id?: string;
      readonly version?: number;
    } = {},
  ): BootstrapBuilder {
    return new BootstrapBuilder(
      options.id ?? `bootstrap-${randomUUID()}`,
      options.version ?? 1,
    );
  }

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  /**
   * Register bootstrap action.
   */
  public add(
    action: BootstrapAction,
    options?: {
      readonly dependencies?: readonly string[];
      readonly metadata?: Readonly<Record<string, unknown>>;
    },
  ): this {
    const phase = action.phase;

    if (this.steps.has(phase.name)) {
      throw new Error(`Bootstrap phase already registered: ${phase.name}`);
    }

    const step: BootstrapStep = Object.freeze({
      phase,

      action,

      dependencies: options?.dependencies,

      metadata: options?.metadata,
    });

    this.steps.set(phase.name, step);

    return this;
  }

  /**
   * Register multiple actions.
   */
  public addMany(actions: readonly BootstrapAction[]): this {
    for (const action of actions) {
      this.add(action);
    }

    return this;
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(): BootstrapPlan {
    const orderedSteps = [...this.steps.values()]
      .sort((left, right) => left.phase.order - right.phase.order)
      .map((step) => Object.freeze(step));

    return Object.freeze({
      id: this.id,

      version: this.version,

      steps: Object.freeze(orderedSteps),

      count: orderedSteps.length,

      createdAt: new Date(),

      metadata: Object.freeze({
        ...this.metadata,

        phases: orderedSteps.map((step) => step.phase.name),
      }),
    });
  }

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  public withMetadata(metadata: Readonly<Record<string, unknown>>): this {
    Object.assign(this.metadata, metadata);

    return this;
  }
}

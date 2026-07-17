import { InstrumentationRuntime } from "../contracts/instrumentation-runtime";

import { InstrumentationRuntimeContext } from "./instrumentation-runtime.context";

/* =============================================================================
 * Instrumentation Runtime Builder
 * =============================================================================
 *
 * Produces the immutable InstrumentationRuntime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate runtime invariants
 * • Compute execution diagnostics
 * • Assemble runtime metadata
 * • Produce immutable runtime snapshot
 * • Seal every runtime collection
 *
 * The builder is the final stage of the instrumentation lifecycle.
 *
 * It transforms a mutable runtime context into an immutable execution report.
 *
 * =============================================================================
 */

export class InstrumentationRuntimeBuilder {
  private constructor(
    private readonly context: InstrumentationRuntimeContext,
  ) {}

  /**
   * Factory.
   */
  public static create(
    context: InstrumentationRuntimeContext,
  ): InstrumentationRuntimeBuilder {
    return new InstrumentationRuntimeBuilder(context);
  }

  /**
   * Builds the immutable runtime.
   */
  public build(): InstrumentationRuntime {
    this.validate();

    const runtime = this.assemble();

    return this.seal(runtime);
  }

  /**
   * ---------------------------------------------------------------------------
   * Validate runtime invariants.
   * ---------------------------------------------------------------------------
   */
  protected validate(): void {
    if (!this.context.id) {
      throw new Error(
        "InstrumentationRuntimeBuilder: Runtime identifier is missing.",
      );
    }

    if (!this.context.startedAt) {
      throw new Error(
        "InstrumentationRuntimeBuilder: Runtime start timestamp is missing.",
      );
    }

    if (!this.context.options) {
      throw new Error(
        "InstrumentationRuntimeBuilder: Instrumentation options are missing.",
      );
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Assemble runtime.
   * ---------------------------------------------------------------------------
   */
  protected assemble(): InstrumentationRuntime {
    const completedAt = new Date();

    return {
      id: this.context.id,

      startedAt: this.context.startedAt,

      completedAt,

      duration: this.computeDuration(completedAt),

      environment: this.context.environment,

      debug: this.context.debug,

      attributes: this.context.attributes,

      options: this.context.options,

      providers: [...this.context.providers],

      metadata: this.context.metadataSnapshot,

      errors: this.context.failuresSnapshot,

      healthy: this.computeHealth(),

      summary: this.buildSummary(),

      diagnostics: this.buildDiagnostics(),

      capabilities: this.collectCapabilities(),

      timeline: this.buildTimeline(),
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Computes bootstrap duration.
   * ---------------------------------------------------------------------------
   */
  protected computeDuration(completedAt: Date): number {
    return completedAt.getTime() - this.context.startedAt.getTime();
  }

  /**
   * ---------------------------------------------------------------------------
   * Computes runtime health.
   * ---------------------------------------------------------------------------
   */
  protected computeHealth(): boolean {
    return this.context.healthy && this.context.failuresSnapshot.size === 0;
  }

  /**
   * ---------------------------------------------------------------------------
   * Builds runtime summary.
   * ---------------------------------------------------------------------------
   */
  protected buildSummary() {
    return {
      providerCount: this.context.providers.length,

      enabledProviders: this.context.providers.length,

      failedProviders: this.context.failuresSnapshot.size,
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Builds diagnostics report.
   * ---------------------------------------------------------------------------
   */
  protected buildDiagnostics() {
    return {
      healthy: this.computeHealth(),

      warnings: [],

      failures: [...this.context.failuresSnapshot.keys()],
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Collects runtime capabilities.
   * ---------------------------------------------------------------------------
   */
  protected collectCapabilities(): readonly string[] {
    return [];
  }

  /**
   * ---------------------------------------------------------------------------
   * Produces execution timeline.
   * ---------------------------------------------------------------------------
   */
  protected buildTimeline(): readonly unknown[] {
    return [];
  }

  /**
   * ---------------------------------------------------------------------------
   * Seals runtime.
   * ---------------------------------------------------------------------------
   */
  protected seal(runtime: InstrumentationRuntime): InstrumentationRuntime {
    Object.freeze(runtime.providers);

    Object.freeze(runtime.summary);

    Object.freeze(runtime.diagnostics);

    Object.freeze(runtime.capabilities);

    Object.freeze(runtime.timeline);

    Object.freeze(runtime);

    return runtime;
  }
}

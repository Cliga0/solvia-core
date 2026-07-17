import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPipeline } from "./contracts/bootstrap-pipeline";
import type { PipelineResult } from "./contracts/pipeline-result";

import { PipelineBuilder } from "./pipeline.builder";
import { PipelineValidator } from "./pipeline.validator";
import { PipelineExecutor } from "./pipeline.executor";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { BootstrapActionRegistry } from "../actions/bootstrap-action.registry";

/* =============================================================================
 * Pipeline Engine
 * =============================================================================
 *
 * Public orchestration facade of the Solvia Kernel bootstrap pipeline.
 *
 * PipelineEngine coordinates the complete pipeline lifecycle:
 *
 *      Build
 *        |
 *      Validate
 *        |
 *      Execute
 *
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Coordinate pipeline construction
 * • Validate execution plan
 * • Delegate execution
 * • Expose pipeline lifecycle
 *
 *
 * Does NOT:
 *
 * • Define bootstrap phases
 * • Execute phase logic
 * • Resolve dependencies
 * • Perform infrastructure work
 *
 *
 * Architecture:
 *
 *
 * BootstrapRuntimeContext
 *            |
 *            v
 *     PipelineEngine
 *            |
 *     +------+------+
 *     |             |
 *     v             v
 * Builder       Validator
 *     |
 *     v
 * ExecutionPlan
 *     |
 *     v
 * Executor
 *
 *
 * =============================================================================
 */

export class PipelineEngine implements BootstrapPipeline {
  /**
   * Factory.
   */
  public static create(
    context: BootstrapRuntimeContext,
    registry: BootstrapActionRegistry,
  ): PipelineEngine {
    return new PipelineEngine(
      context,
      new PipelineBuilder(),
      new PipelineValidator(),
      new PipelineExecutor(registry),
      registry,
    );
  }

  /**
   * Runtime context.
   */
  public readonly context: BootstrapRuntimeContext;

  /**
   * Internal collaborators.
   */
  private readonly builder: PipelineBuilder;

  private readonly validator: PipelineValidator;

  private readonly executor: PipelineExecutor;

  private readonly registry: BootstrapActionRegistry;

  private pipelineBuilt = false;

  /**
   * Constructor.
   *
   * Kept private to ensure every PipelineEngine is created
   * through the factory with a complete and valid configuration.
   */
  private constructor(
    context: BootstrapRuntimeContext,
    builder: PipelineBuilder,
    validator: PipelineValidator,
    executor: PipelineExecutor,
    registry: BootstrapActionRegistry,
  ) {
    this.context = context;
    this.builder = builder;
    this.validator = validator;
    this.executor = executor;
    this.registry = registry;
  }

  /**
   * ---------------------------------------------------------------------------
   * Execute complete bootstrap pipeline.
   *
   * Lifecycle:
   *
   * Build
   *   |
   * Validate
   *   |
   * Execute
   *
   * ---------------------------------------------------------------------------
   */
  public async execute(): Promise<PipelineResult> {
    this.buildPipelinePlan();

    const plan = this.builder.build();

    this.validator.validate(plan);

    return this.executor.execute(plan, this.context);
  }

  /**
   * ---------------------------------------------------------------------------
   * Add multiple phases.
   *
   * Delegated to builder.
   * ---------------------------------------------------------------------------
   */

  private assertMutable(): void {
    if (this.pipelineBuilt) {
      throw new Error(
        "PipelineEngine is already built and cannot be modified.",
      );
    }
  }

  public addPhase(phase: Parameters<PipelineBuilder["addPhase"]>[0]): this {
    this.assertMutable();

    this.builder.addPhase(phase);

    return this;
  }

  private buildPipelinePlan(): void {
    if (this.pipelineBuilt) {
      return;
    }

    const phases = this.registry
      .all()
      .filter((action) => !action.phase.internal)
      .map((action) => action.phase);

    for (const phase of phases) {
      this.builder.addPhase(phase);
    }

    this.pipelineBuilt = true;
  }
}

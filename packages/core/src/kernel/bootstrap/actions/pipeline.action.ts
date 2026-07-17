import type { BootstrapAction } from "../contracts/bootstrap-action";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { PipelineResult } from "../pipeline/contracts/pipeline-result";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { PipelineEngine } from "../pipeline/pipeline.engine";
import { BootstrapActionRegistry } from "./bootstrap-action.registry";

/* =============================================================================
 * Pipeline Action
 * =============================================================================
 *
 * Bootstrap action responsible for executing the Kernel bootstrap pipeline.
 *
 * The Pipeline Action delegates the complete execution lifecycle to the
 * Pipeline Engine.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • execute the bootstrap pipeline
 * • coordinate phase execution
 * • expose execution result
 *
 * It does NOT:
 *
 * • build the runtime
 * • resolve contributions
 * • perform discovery
 * • build registries
 *
 * =============================================================================
 */

export class PipelineAction implements BootstrapAction {
  /**
   * Associated bootstrap phase.
   */
  public readonly phase = BootstrapPhasesCatalog.PIPELINE;

  constructor(private readonly registry: BootstrapActionRegistry) {}

  /**
   * ---------------------------------------------------------------------------
   * Execute bootstrap pipeline.
   * ---------------------------------------------------------------------------
   */
  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const result = await this.run(context);

    this.attach(context, result);
  }

  /* ===========================================================================
   * Pipeline
   * ========================================================================= */

  /**
   * Execute the bootstrap pipeline.
   */
  protected async run(
    context: BootstrapRuntimeContext,
  ): Promise<PipelineResult> {
    return PipelineEngine.create(context, this.registry).execute();
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Publish pipeline execution result.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    result: PipelineResult,
  ): void {
    context.attachPipeline(result);
  }
}

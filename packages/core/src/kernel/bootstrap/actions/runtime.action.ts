import type { BootstrapAction } from "../contracts/bootstrap-action";

import type { BootstrapRuntime } from "../runtime/contracts/bootstrap-runtime";
import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { RuntimeBuilder } from "../runtime/runtime.builder";

/* =============================================================================
 * Runtime Action
 * =============================================================================
 *
 * Bootstrap action responsible for assembling the immutable Bootstrap Runtime.
 *
 * RuntimeAction represents the final infrastructure step of the Kernel
 * bootstrap lifecycle. It transforms every artifact accumulated during
 * bootstrap into the immutable runtime exposed to the application layer.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • build the Bootstrap Runtime
 * • aggregate bootstrap artifacts
 * • publish the runtime
 * • finalize bootstrap
 *
 * It does NOT:
 *
 * • execute the bootstrap pipeline
 * • perform discovery
 * • resolve contributions
 * • register providers
 *
 * =============================================================================
 */

export class RuntimeAction implements BootstrapAction {
  /**
   * Associated bootstrap phase.
   */
  public readonly phase = BootstrapPhasesCatalog.RUNTIME;

  /**
   * ---------------------------------------------------------------------------
   * Execute runtime assembly.
   * ---------------------------------------------------------------------------
   */
  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const runtime = this.build(context);

    this.attach(context, runtime);

    context.markReady();
  }

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  /**
   * Build the immutable Bootstrap Runtime.
   */
  protected build(context: BootstrapRuntimeContext): BootstrapRuntime {
    const contributions = context.contributions;

    const discovery = context.discovery;

    const registry = context.registry;

    if (!contributions) {
      throw new Error("Contribution runtime missing.");
    }

    if (!discovery) {
      throw new Error("Discovery result missing.");
    }

    if (!registry) {
      throw new Error("Registry snapshot missing.");
    }

    return RuntimeBuilder.create(context)
      .withContributions(contributions)
      .withDiscovery(discovery)
      .withRegistry(registry)
      .build();
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Publish the runtime.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    runtime: BootstrapRuntime,
  ): void {
    context.attachRuntime(runtime);
  }
}

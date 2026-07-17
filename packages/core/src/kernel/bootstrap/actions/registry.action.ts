import type { BootstrapAction } from "../contracts/bootstrap-action";
import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { RegistrySnapshot } from "../registry/contracts/registry-snapshot";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { RegistryEngine } from "../registry/registry.engine";

/* =============================================================================
 * Registry Action
 * =============================================================================
 *
 * Bootstrap action responsible for constructing the immutable Kernel registry.
 *
 * The registry normalizes every artifact produced during discovery and
 * contribution loading into a single immutable RegistrySnapshot consumed by
 * the remainder of the bootstrap lifecycle.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • build the Kernel registry
 * • normalize discovered artifacts
 * • aggregate contribution artifacts
 * • publish the RegistrySnapshot into the runtime context
 *
 * It does NOT:
 *
 * • discover modules
 * • resolve contributions
 * • instantiate providers
 * • build the runtime
 *
 * =============================================================================
 */

export class RegistryAction implements BootstrapAction {
  /**
   * Associated bootstrap phase.
   */
  public readonly phase = BootstrapPhasesCatalog.REGISTRY;

  /**
   * ---------------------------------------------------------------------------
   * Execute registry construction.
   * ---------------------------------------------------------------------------
   */
  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const registry = await this.build(context);

    this.attach(context, registry);
  }

  /* ===========================================================================
   * Registry
   * ========================================================================= */

  /**
   * Build the immutable registry snapshot.
   */
  protected async build(
    context: BootstrapRuntimeContext,
  ): Promise<RegistrySnapshot> {
    return RegistryEngine.build(context);
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Publish the registry snapshot.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    registry: RegistrySnapshot,
  ): void {
    context.attachRegistry(registry);
  }
}

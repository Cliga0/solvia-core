import type { BootstrapAction } from "../contracts/bootstrap-action";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { DiscoveryResult } from "../discovery/contracts/discovery-result";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { DiscoveryEngine } from "../discovery/discovery.engine";

/* =============================================================================
 * Discovery Action
 * =============================================================================
 *
 * Bootstrap action responsible for discovering every artifact participating in
 * the current Kernel bootstrap session.
 *
 * Discovery transforms loaded Kernel contributions into a normalized discovery
 * graph consumed by the Registry subsystem.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • execute the Discovery Engine
 * • discover Kernel modules
 * • discover providers
 * • discover controllers
 * • discover middlewares
 * • discover guards
 * • discover interceptors
 * • discover exception filters
 * • publish the DiscoveryResult
 *
 * It does NOT:
 *
 * • resolve contributions
 * • load contributions
 * • build registries
 * • instantiate providers
 * • bootstrap NestJS
 *
 * =============================================================================
 */

export class DiscoveryAction implements BootstrapAction {
  /**
   * Associated bootstrap phase.
   */
  public readonly phase = BootstrapPhasesCatalog.DISCOVERY;

  /**
   * ---------------------------------------------------------------------------
   * Execute discovery.
   * ---------------------------------------------------------------------------
   */
  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const discovery = await this.discover(context);

    this.attach(context, discovery);
  }

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  /**
   * Execute the Discovery Engine.
   */
  protected async discover(
    context: BootstrapRuntimeContext,
  ): Promise<DiscoveryResult> {
    return DiscoveryEngine.run(context);
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Publish the immutable discovery result.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    discovery: DiscoveryResult,
  ): void {
    context.attachDiscovery(discovery);
  }
}

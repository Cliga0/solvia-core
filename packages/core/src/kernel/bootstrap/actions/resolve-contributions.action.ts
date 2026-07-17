import type { BootstrapAction } from "../contracts/bootstrap-action";
import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { ContributionResolver } from "../../contributions/resolver/contribution.resolver";

/* =============================================================================
 * Resolve Contributions Action
 * =============================================================================
 *
 * Bootstrap action responsible for resolving every Kernel contribution
 * participating in the current bootstrap session.
 *
 * Resolution is purely declarative.
 *
 * No contribution is instantiated nor executed during this stage.
 *F
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • resolve Kernel contributions
 * • validate contribution graph
 * • preserve deterministic ordering
 * • expose resolved contributions to the runtime context
 *
 * It does NOT:
 *
 * • load contributions
 * • execute contribution lifecycle
 * • instantiate providers
 * • build registries
 *
 * =============================================================================
 */

export class ResolveContributionsAction implements BootstrapAction {
  /**
   * Associated bootstrap phase.
   */
  public readonly phase = BootstrapPhasesCatalog.RESOLVE_CONTRIBUTIONS;

  /**
   * ---------------------------------------------------------------------------
   * Execute contribution resolution.
   * ---------------------------------------------------------------------------
   */
  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const contributions = await this.resolve(context);

    this.attach(context, contributions);
  }

  /* ===========================================================================
   * Resolution
   * ========================================================================= */

  /**
   * Resolve every Kernel contribution.
   */
  protected async resolve(context: BootstrapRuntimeContext) {
    return ContributionResolver.resolve(context);
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Publish resolved contributions to the runtime context.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    contributions: ReturnType<typeof ContributionResolver.resolve>,
  ): void {
    context.attachResolvedContributions(contributions);
  }
}

import type { BootstrapAction } from "../contracts/bootstrap-action";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import { BootstrapPhasesCatalog } from "../contracts/bootstrap-phase.catalog";

import { ContributionLoader } from "../../contributions/loader/contribution.loader";

import type { ContributionCatalog } from "../../contributions/registry/contribution.catalog";

import type { ContributionManagerRuntime } from "../../contributions/runtime/contribution-manager-runtime";

/* =============================================================================
 * Load Contributions Action
 * =============================================================================
 *
 * Loads resolved Kernel contributions into executable contribution runtimes.
 *
 *
 * Flow:
 *
 * Resolved Contributions
 *          |
 *          v
 * ContributionLoader
 *          |
 *          v
 * ContributionManagerRuntime
 *
 *
 * Responsibilities:
 *
 * • Retrieve resolved contributions
 * • Execute contribution loading
 * • Publish runtime artifact
 *
 *
 * Does NOT:
 *
 * • Discover contributions
 * • Resolve dependencies
 * • Validate definitions
 * • Execute bootstrap orchestration
 *
 * =============================================================================
 */

export class LoadContributionsAction implements BootstrapAction {
  /**
   * Bootstrap phase handled by this action.
   */
  public readonly phase = BootstrapPhasesCatalog.LOAD_CONTRIBUTIONS;

  /**
   * Action dependencies.
   *
   * BootstrapRuntimeContext owns state only.
   * Infrastructure dependencies stay explicit.
   */
  public constructor(private readonly catalog: ContributionCatalog) {}

  /* ===========================================================================
   * Execution
   * ========================================================================= */

  public async execute(context: BootstrapRuntimeContext): Promise<void> {
    const runtime = await this.load(context);

    this.attach(context, runtime);
  }

  /* ===========================================================================
   * Loading
   * ========================================================================= */

  /**
   * Loads resolved contributions.
   */
  protected async load(
    context: BootstrapRuntimeContext,
  ): Promise<ContributionManagerRuntime> {
    const loader = new ContributionLoader(context, this.catalog);

    return loader.load(context.resolvedContributions());
  }

  /* ===========================================================================
   * Publication
   * ========================================================================= */

  /**
   * Publishes contribution runtime into bootstrap state.
   */
  protected attach(
    context: BootstrapRuntimeContext,
    runtime: ContributionManagerRuntime,
  ): void {
    context.attachContributions(runtime);
  }
}

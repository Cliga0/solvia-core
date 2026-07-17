import type { BootstrapContext } from "../../bootstrap/contracts/bootstrap-context";

import type { ContributionManagerRuntime } from "../runtime/contribution-manager-runtime";
import type { KernelContribution } from "../contracts/kernel-contribution";

import { ContributionCatalog } from "../registry/contribution.catalog";
import { ContributionLifecycle } from "../lifecycle/contribution.lifecycle";

import { ContributionContextBuilder } from "../builder/contribution-context.builder";
import { ContributionRuntimeBuilder } from "../builder/contribution-runtime.builder";
import { ContributionManagerRuntimeBuilder } from "../builder/contribution-manager-runtime.builder";
import { ContributionRuntime } from "../runtime/contribution-runtime";

/* =============================================================================
 * Contribution Loader
 * =============================================================================
 *
 * Orchestrates the complete Contribution loading pipeline.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Register resolved contributions
 * • Build contribution contexts
 * • Build contribution runtimes
 * • Execute lifecycle
 * • Register runtimes
 * • Produce immutable ContributionManagerRuntime
 *
 * Does NOT:
 *
 * • discover contributions
 * • resolve dependencies
 * • execute bootstrap pipeline
 * • implement lifecycle logic
 *
 * =============================================================================
 *
 * Lifecycle
 *
 * Register
 *      │
 *      ▼
 * Contexts
 *      │
 *      ▼
 * Load
 *      │
 *      ▼
 * Runtime creation
 *      │
 *      ▼
 * Start
 *      │
 *      ▼
 * Ready
 *      │
 *      ▼
 * Manager Runtime
 *
 * =============================================================================
 */

export class ContributionLoader {
  public constructor(
    private readonly bootstrap: BootstrapContext,
    private readonly catalog: ContributionCatalog,
  ) {}

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  public async load(
    contributions: readonly KernelContribution[],
  ): Promise<ContributionManagerRuntime> {
    this.catalog.registerMany(contributions);

    const runtimes: ContributionRuntime[] = [];

    for (const contribution of contributions) {
      runtimes.push(await this.loadContribution(contribution));
    }

    return ContributionManagerRuntimeBuilder.create(runtimes).build();
  }

  /* ===========================================================================
   * Contribution loading
   * ========================================================================= */

  private async loadContribution(contribution: KernelContribution) {
    const context = this.buildContext(contribution);

    const lifecycle = ContributionLifecycle.create(contribution, context);

    await lifecycle.load();

    const runtime = this.buildRuntime(contribution);

    this.catalog.attachRuntime(runtime);

    await lifecycle.start(runtime);

    await lifecycle.ready(runtime);

    return runtime;
  }

  /* ===========================================================================
   * Builders
   * ========================================================================= */

  private buildContext(contribution: KernelContribution) {
    return ContributionContextBuilder.create(
      this.bootstrap,
      contribution,
    ).build();
  }

  private buildRuntime(contribution: KernelContribution) {
    return ContributionRuntimeBuilder.create(contribution).build();
  }
}

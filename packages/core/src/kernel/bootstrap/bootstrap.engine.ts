import type { BootstrapOptions } from "./contracts/bootstrap-options";
import type { BootstrapRuntime } from "./runtime/contracts/bootstrap-runtime";

import { RuntimeContext } from "./runtime/runtime.context";

import { BootstrapBuilder } from "./bootstrap.builder";
import { BootstrapExecutor } from "./bootstrap.executor";

import { BootstrapActionRegistry } from "./actions/bootstrap-action.registry";

import { InitializeAction } from "./actions/initialize.action";
import { ResolveContributionsAction } from "./actions/resolve-contributions.action";
import { LoadContributionsAction } from "./actions/load-contributions.action";
import { DiscoveryAction } from "./actions/discovery.action";
import { RegistryAction } from "./actions/registry.action";
import { PipelineAction } from "./actions/pipeline.action";
import { RuntimeAction } from "./actions/runtime.action";
import { ContributionCatalog } from "../contributions/registry/contribution.catalog";

/* =============================================================================
 * Bootstrap Engine
 * =============================================================================
 *
 * Kernel bootstrap orchestration facade.
 *
 * Architecture:
 *
 * BootstrapEngine
 *        |
 *        v
 * RuntimeContext
 *        |
 *        v
 * BootstrapActionRegistry
 *        |
 *        v
 * BootstrapBuilder
 *        |
 *        v
 * BootstrapPlan
 *        |
 *        v
 * BootstrapExecutor
 *        |
 *        v
 * BootstrapRuntime
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • create bootstrap runtime context
 * • compose bootstrap capabilities
 * • build execution plan
 * • delegate execution
 *
 *
 * Does NOT:
 *
 * • execute actions directly
 * • implement bootstrap phases
 * • manage infrastructure lifecycle
 *
 * =============================================================================
 */

export class BootstrapEngine {
  /* ===========================================================================
   * State
   * ========================================================================= */

  private readonly context: RuntimeContext;

  private readonly registry: BootstrapActionRegistry;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor(options: BootstrapOptions) {
    this.context = RuntimeContext.create(options);

    this.registry = this.createRegistry(this.context.contributionCatalog());
  }

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(options: BootstrapOptions = {}): BootstrapEngine {
    return new BootstrapEngine(options);
  }

  /* ===========================================================================
   * Bootstrap
   * ========================================================================= */

  /**
   * Execute complete Kernel bootstrap lifecycle.
   */
  public async boot(): Promise<BootstrapRuntime> {
    const executor = new BootstrapExecutor(this.context);

    try {
      const result = await executor.execute(this.createPlan());

      if (!result.success) {
        throw result.error;
      }

      if (!result.runtime) {
        throw new Error("Bootstrap completed without producing runtime.");
      }

      this.context.markReady().markCompleted();

      return result.runtime;
    } catch (error) {
      this.context.markFailed(
        error instanceof Error ? error : new Error(String(error)),
      );

      throw error;
    }
  }

  /* ===========================================================================
   * Action Composition
   * ========================================================================= */

  /**
   * Compose Kernel bootstrap capabilities.
   */
  private createRegistry(
    contributionCatalog: ContributionCatalog,
  ): BootstrapActionRegistry {
    const registry = BootstrapActionRegistry.create();

    registry
      .register(new InitializeAction())

      .register(new ResolveContributionsAction())

      .register(new LoadContributionsAction(contributionCatalog))

      .register(new DiscoveryAction())

      .register(new RegistryAction());

    registry.register(new PipelineAction(registry));

    registry.register(new RuntimeAction());

    return registry.seal();
  }

  /* ===========================================================================
   * Plan
   * ========================================================================= */

  /**
   * Transform action registry into immutable bootstrap plan.
   */
  private createPlan() {
    const builder = BootstrapBuilder.create({
      id: "solvia-bootstrap",
      version: 1,
    });

    for (const action of this.registry.all()) {
      builder.add(action);
    }

    return builder.build();
  }
}

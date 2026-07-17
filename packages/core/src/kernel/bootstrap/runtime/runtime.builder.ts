import type { BootstrapContext } from "../contracts/bootstrap-context";
import type { BootstrapRuntime } from "./contracts/bootstrap-runtime";

import type { DiscoveryResult } from "../discovery/contracts/discovery-result";
import type { RegistrySnapshot } from "../registry/contracts/registry-snapshot";

import type { ContributionManagerRuntime } from "../../contributions/runtime/contribution-manager-runtime";

/* =============================================================================
 * Runtime Builder
 * =============================================================================
 *
 * Assembles the immutable BootstrapRuntime produced by the bootstrap pipeline.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate bootstrap invariants
 * • Assemble runtime artifacts
 * • Produce immutable runtime
 *
 * The RuntimeBuilder never performs discovery, registration or initialization.
 * It only materializes the final runtime view.
 *
 * =============================================================================
 */

export class RuntimeBuilder {
  private contributions?: ContributionManagerRuntime;

  private discovery?: DiscoveryResult;

  private registry?: RegistrySnapshot;

  private constructor(private readonly context: BootstrapContext) {}

  /**
   * Factory.
   */
  public static create(context: BootstrapContext): RuntimeBuilder {
    return new RuntimeBuilder(context);
  }

  /**
   * Attach contribution runtime.
   */
  public withContributions(contributions: ContributionManagerRuntime): this {
    this.contributions = contributions;

    return this;
  }

  /**
   * Attach discovery graph.
   */
  public withDiscovery(discovery: DiscoveryResult): this {
    this.discovery = discovery;

    return this;
  }

  /**
   * Attach registry snapshot.
   */
  public withRegistry(registry: RegistrySnapshot): this {
    this.registry = registry;

    return this;
  }

  /**
   * Produce immutable runtime.
   */
  public build(): BootstrapRuntime {
    this.validate();

    return Object.freeze(this.assemble());
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(): void {
    if (!this.contributions) {
      throw new Error("RuntimeBuilder: Contribution runtime missing.");
    }

    if (!this.discovery) {
      throw new Error("RuntimeBuilder: Discovery result missing.");
    }

    if (!this.registry) {
      throw new Error("RuntimeBuilder: Registry snapshot missing.");
    }
  }

  /* ===========================================================================
   * Assembly
   * ========================================================================= */

  private assemble(): BootstrapRuntime {
    return {
      /*
       * Identity
       */
      id: this.context.id,

      startedAt: this.context.startedAt,

      /*
       * Context
       */
      context: this.context,

      /*
       * Bootstrap artifacts
       */
      contributions: this.contributions!,

      discovery: this.discovery!,

      registry: this.registry!,

      /*
       * Lifecycle
       */
      phases: this.context.phases,

      /*
       * Environment
       */
      profile: this.context.profile,

      environment: this.context.environment,

      version: this.context.version,

      /*
       * Features
       */
      features: Object.freeze([...this.context.features]),
    };
  }
}

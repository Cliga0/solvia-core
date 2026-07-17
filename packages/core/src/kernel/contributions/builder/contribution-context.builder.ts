import type { BootstrapContext } from "../../bootstrap/contracts/bootstrap-context";

import type { ContributionContext } from "../contracts/contribution-context";
import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Context Builder
 * =============================================================================
 *
 * Builds immutable ContributionContext instances consumed by the contribution
 * lifecycle.
 *
 * The builder is the single construction entry point for contribution runtime
 * contexts.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Build immutable ContributionContext objects
 * • Preserve bootstrap information
 * • Inject contribution identity
 * • Attach contribution configuration
 * • Attach diagnostics metadata
 *
 * Does NOT:
 *
 * • execute lifecycle hooks
 * • load contributions
 * • resolve dependencies
 * • mutate bootstrap state
 *
 * =============================================================================
 */

export class ContributionContextBuilder {
  /**
   * Bootstrap context.
   */
  private readonly bootstrap: BootstrapContext;

  /**
   * Contribution definition.
   */
  private readonly contribution: KernelContribution;

  /**
   * Contribution configuration.
   */
  private configuration: Readonly<Record<string, unknown>> = Object.freeze({});

  /**
   * Runtime metadata.
   */
  private metadata: Readonly<Record<string, unknown>> = Object.freeze({});

  private constructor(
    bootstrap: BootstrapContext,
    contribution: KernelContribution,
  ) {
    this.bootstrap = bootstrap;
    this.contribution = contribution;

    this.metadata = contribution.metadata ?? Object.freeze({});
  }

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    bootstrap: BootstrapContext,
    contribution: KernelContribution,
  ): ContributionContextBuilder {
    return new ContributionContextBuilder(bootstrap, contribution);
  }

  /* ===========================================================================
   * Configuration
   * ========================================================================= */

  public withConfiguration(
    configuration: Readonly<Record<string, unknown>>,
  ): this {
    this.configuration = Object.freeze({ ...configuration });

    return this;
  }

  public withMetadata(metadata: Readonly<Record<string, unknown>>): this {
    this.metadata = Object.freeze({
      ...this.metadata,
      ...metadata,
    });

    return this;
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(): ContributionContext {
    return Object.freeze({
      bootstrapId: this.bootstrap.id,

      startedAt: this.bootstrap.startedAt,

      environment: this.bootstrap.environment,

      contribution: this.contribution.name,

      configuration: this.configuration,

      bootstrap: this.bootstrap,

      metadata: this.metadata,
    });
  }
}

import type { ContributionDefinition } from "./contribution-definition";

/* =============================================================================
 * Contribution Resolution Context
 * =============================================================================
 *
 * Immutable input context used by the Contribution Resolver.
 *
 * The context describes every available source from which Kernel contributions
 * can be resolved.
 *
 * It is intentionally independent from BootstrapContext.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Provide explicit contributions
 * • Provide workspace contributions
 * • Provide package contributions
 * • Provide plugin contributions
 * • Carry resolution metadata
 *
 * The context never:
 *
 * • validates contributions
 * • resolves dependencies
 * • instantiates contributions
 * • executes lifecycle
 *
 * =============================================================================
 */

export interface ContributionResolutionContext {
  /* ===========================================================================
   * Explicit Contributions
   * ========================================================================= */

  /**
   * Contributions explicitly provided by the application.
   *
   * Example:
   *
   * App configuration
   * Kernel setup
   *
   */
  readonly explicit: readonly ContributionDefinition[];

  /* ===========================================================================
   * Workspace Contributions
   * ========================================================================= */

  /**
   * Contributions discovered from the current workspace.
   *
   * Examples:
   *
   * packages/*
   * internal modules
   * monorepo extensions
   */
  readonly workspace: readonly ContributionDefinition[];

  /* ===========================================================================
   * External Packages
   * ========================================================================= */

  /**
   * Contributions provided by installed packages.
   *
   * Examples:
   *
   * npm packages
   * private registries
   * enterprise extensions
   */
  readonly packages: readonly ContributionDefinition[];

  /* ===========================================================================
   * Runtime Plugins
   * ========================================================================= */

  /**
   * Contributions injected dynamically at runtime.
   *
   * Examples:
   *
   * plugin loaders
   * feature extensions
   * tenant modules
   */
  readonly plugins: readonly ContributionDefinition[];

  /* ===========================================================================
   * Resolution Metadata
   * ========================================================================= */

  /**
   * Optional resolver metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • tracing
   * • tooling
   * • profiling
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

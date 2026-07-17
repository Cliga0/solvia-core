import type { BootstrapContext } from "../../bootstrap/contracts/bootstrap-context";

/* =============================================================================
 * Contribution Context
 * =============================================================================
 *
 * Runtime context provided to Kernel Contributions.
 *
 * A contribution never accesses the bootstrap system directly.
 * The Kernel injects this context during lifecycle execution.
 *
 * Responsibilities:
 *
 *  • Expose bootstrap identity
 *  • Expose environment information
 *  • Provide contribution metadata
 *  • Provide isolated configuration
 *  • Provide controlled runtime access
 *
 * The context is immutable from the contribution perspective.
 *
 * =============================================================================
 */

export interface ContributionContext {
  /**
   * ---------------------------------------------------------------------------
   * Current bootstrap identifier.
   *
   * Allows correlation between:
   *
   *  - logs
   *  - telemetry
   *  - diagnostics
   *
   * ---------------------------------------------------------------------------
   */
  readonly bootstrapId: string;

  /**
   * ---------------------------------------------------------------------------
   * Bootstrap start timestamp.
   * ---------------------------------------------------------------------------
   */
  readonly startedAt: Date;

  /**
   * ---------------------------------------------------------------------------
   * Current environment.
   *
   * Examples:
   *
   * development
   * production
   * test
   *
   * ---------------------------------------------------------------------------
   */
  readonly environment: string;

  /**
   * ---------------------------------------------------------------------------
   * Contribution identity.
   *
   * Example:
   *
   * "metrics"
   *
   * ---------------------------------------------------------------------------
   */
  readonly contribution: string;

  /**
   * ---------------------------------------------------------------------------
   * Contribution specific configuration.
   *
   * Example:
   *
   * {
   *    exporter:"otlp"
   * }
   *
   * ---------------------------------------------------------------------------
   */
  readonly configuration: Readonly<Record<string, unknown>>;

  /**
   * ---------------------------------------------------------------------------
   * Bootstrap context reference.
   *
   * Read-only access to global bootstrap state.
   *
   * ---------------------------------------------------------------------------
   */
  readonly bootstrap: Readonly<BootstrapContext>;

  /**
   * ---------------------------------------------------------------------------
   * Runtime metadata.
   *
   * Used by diagnostics and tooling.
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

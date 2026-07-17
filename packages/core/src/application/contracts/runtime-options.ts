/* =============================================================================
 * Runtime Options
 * =============================================================================
 *
 * Controls how the Solvia Application Runtime behaves.
 *
 * Runtime options affect the execution environment only.
 *
 * They never modify business logic.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Bootstrap diagnostics
 * • Runtime optimizations
 * • Debug capabilities
 * • Framework runtime behavior
 *
 * Future:
 *
 * • hotReload
 * • profiling
 * • tracing
 * • metrics
 * • snapshots
 * • inspector
 *
 * =============================================================================
 */

export interface RuntimeOptions {
  /* ===========================================================================
   * Bootstrap
   * ========================================================================= */

  /**
   * Buffers logs during bootstrap.
   *
   * Useful when the logger is initialized after
   * the Nest application has been created.
   *
   * Default:
   *
   * false
   */
  readonly bufferLogs?: boolean;

  /**
   * Enables raw request body support.
   *
   * Required by:
   *
   * - Stripe
   * - GitHub Webhooks
   * - Slack Events
   */
  readonly rawBody?: boolean;

  /**
   * Enables Nest snapshot mode.
   *
   * Primarily intended for development.
   */
  readonly snapshot?: boolean;

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Enables runtime diagnostics.
   */
  readonly diagnostics?: boolean;

  /**
   * Enables verbose runtime logging.
   */
  readonly verbose?: boolean;

  /**
   * Enables performance profiling.
   *
   * Future extension.
   */
  readonly profiling?: boolean;

  /**
   * Enables runtime tracing.
   *
   * Future extension.
   */
  readonly tracing?: boolean;

  /**
   * Enables runtime metrics.
   *
   * Future extension.
   */
  readonly metrics?: boolean;

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  /**
   * Runtime metadata.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
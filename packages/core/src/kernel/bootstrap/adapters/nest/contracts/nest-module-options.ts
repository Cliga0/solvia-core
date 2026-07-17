/* =============================================================================
 * Nest Module Options Contract
 * =============================================================================
 *
 * Configuration contract controlling how Solvia runtime is exposed as a NestJS
 * dynamic module.
 *
 *
 * Architecture
 * ---------------------------------------------------------------------------
 *
 *        Application Configuration
 *                  |
 *                  v
 *        Nest Module Options
 *                  |
 *                  v
 *       DynamicModuleBuilder
 *                  |
 *                  v
 *          Nest DynamicModule
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Configure Nest module exposure
 * • Define adapter composition behavior
 * • Control module visibility
 *
 *
 * Does NOT:
 *
 * • Configure Kernel bootstrap
 * • Resolve dependencies
 * • Register providers
 * • Execute lifecycle hooks
 *
 * =============================================================================
 */

/* =============================================================================
 * Nest Module Options
 * =============================================================================
 *
 * Immutable configuration used by the Nest adapter layer.
 *
 * =============================================================================
 */

export interface NestModuleOptions {
  /* ===========================================================================
   * Module Visibility
   * ========================================================================= */

  /**
   * Register generated module as global.
   *
   * When enabled, Nest exposes providers from this module globally.
   *
   * Default:
   *
   * false
   */
  readonly global?: boolean;

  /* ===========================================================================
   * Lifecycle Integration
   * ========================================================================= */

  /**
   * Enable Nest lifecycle bridge.
   *
   * When enabled, the adapter connects Nest lifecycle events
   * with Solvia runtime lifecycle.
   *
   * Default:
   *
   * true
   */
  readonly enableLifecycleBridge?: boolean;

  /* ===========================================================================
   * Shutdown Integration
   * ========================================================================= */

  /**
   * Enable graceful shutdown integration.
   *
   * Allows Nest termination signals to propagate into Solvia runtime.
   *
   * Default:
   *
   * true
   */
  readonly enableShutdownHooks?: boolean;

  /* ===========================================================================
   * Discovery Integration
   * ========================================================================= */

  /**
   * Enable Nest-side component discovery.
   *
   * Useful for:
   *
   * - controllers
   * - decorators
   * - framework metadata
   *
   * Default:
   *
   * true
   */
  readonly enableDiscovery?: boolean;

  /* ===========================================================================
   * Runtime Metadata
   * ========================================================================= */

  /**
   * Additional adapter metadata.
   *
   * This metadata is never interpreted by the Kernel.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

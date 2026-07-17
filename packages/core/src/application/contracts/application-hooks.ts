import type { INestApplication } from "@nestjs/common";

/* =============================================================================
 * Application Hooks
 * =============================================================================
 *
 * Public lifecycle hooks exposed by the Solvia Application layer.
 *
 * Hooks allow applications and extensions to observe the bootstrap lifecycle
 * without coupling themselves to the internal implementation.
 *
 * Hooks are executed sequentially by the Application Bootstrap pipeline.
 *
 * Hooks MUST:
 *
 * • be side-effect aware
 * • never mutate internal runtime state
 * • never replace infrastructure components
 *
 * They are intended for integration only.
 *
 * Future:
 *
 * • beforeShutdown
 * • afterShutdown
 * • beforeReload
 * • afterReload
 * • beforeHealthCheck
 * • afterHealthCheck
 *
 * =============================================================================
 */

export interface ApplicationHooks {
  /* ===========================================================================
   * Bootstrap
   * ========================================================================= */

  /**
   * Invoked before the application bootstrap begins.
   */
  readonly beforeBootstrap?:
    | (() => void)
    | (() => Promise<void>);

  /**
   * Invoked immediately after the Nest application
   * has been created.
   */
  readonly afterBootstrap?:
    | ((application: INestApplication) => void)
    | ((application: INestApplication) => Promise<void>);

  /* ===========================================================================
   * Server
   * ========================================================================= */

  /**
   * Invoked before the HTTP server starts listening.
   */
  readonly beforeListen?:
    | ((application: INestApplication) => void)
    | ((application: INestApplication) => Promise<void>);

  /**
   * Invoked after the HTTP server is fully operational.
   */
  readonly afterListen?:
    | ((application: INestApplication) => void)
    | ((application: INestApplication) => Promise<void>);

  /* ===========================================================================
   * Shutdown
   * ========================================================================= */

  /**
   * Invoked before graceful shutdown.
   *
   * Future extension.
   */
  readonly beforeShutdown?:
    | ((application: INestApplication) => void)
    | ((application: INestApplication) => Promise<void>);

  /**
   * Invoked after graceful shutdown.
   *
   * Future extension.
   */
  readonly afterShutdown?:
    | (() => void)
    | (() => Promise<void>);
}
import type {
  DynamicModule,
  LoggerService,
  Type,
} from "@nestjs/common";

import type { BootstrapOptions } from "../../kernel/bootstrap/contracts/bootstrap-options";
import { ServerOptions } from "../server/server.options";
import type { RuntimeOptions } from "../contracts/runtime-options";
import type { ApplicationHooks } from "../contracts/application-hooks";
import type { InstrumentationOptions } from "../../instrumentation/contracts/instrumentation-options";

/* =============================================================================
 * Application Options
 * =============================================================================
 *
 * Public configuration contract of the Solvia Application Runtime.
 *
 * ApplicationOptions describe HOW an application should be built,
 * configured and started.
 *
 * They are intentionally framework-agnostic.
 *
 * These options are later translated into:
 *
 * • NestJS options
 * • HTTP server options
 * • Runtime configuration
 * • Infrastructure services
 *
 * ApplicationOptions are immutable once the application starts.
 *
 * =============================================================================
 */

export interface ApplicationOptions {
  /* --------------------------------------------------------------------------
   * Identity
   * ----------------------------------------------------------------------- */

  /**
   * Application name.
   *
   * Example:
   *
   * "Solvia API"
   */
  readonly name?: string;

  /**
   * Application version.
   */
  readonly version?: string;

  /**
   * Running environment.
   */
  readonly environment?: string;

  /* --------------------------------------------------------------------------
   * Bootstrap
   * ----------------------------------------------------------------------- */

  /**
   * Kernel bootstrap options.
   */
  readonly bootstrap?: BootstrapOptions;

  /* --------------------------------------------------------------------------
   * Application Modules
   * ----------------------------------------------------------------------- */

  /**
   * Root application module.
   *
   * Usually AppModule.
   */
  readonly module: Type<unknown>;

  /**
   * Additional imported modules.
   */
  readonly imports?: readonly DynamicModule[];

  /* --------------------------------------------------------------------------
   * Server
   * ----------------------------------------------------------------------- */

  /**
   * HTTP server configuration.
   */
  readonly server?: ServerOptions;

  /* --------------------------------------------------------------------------
   * Runtime
   * ----------------------------------------------------------------------- */

  /**
   * Runtime behaviour.
   */
  readonly runtime?: RuntimeOptions;

  /* --------------------------------------------------------------------------
   * Logging
   * ----------------------------------------------------------------------- */

  /**
   * Custom logger.
   */
  readonly logger?: LoggerService | false;

  /* --------------------------------------------------------------------------
   * Lifecycle
   * ----------------------------------------------------------------------- */

  readonly hooks?: ApplicationHooks;
  
  /* --------------------------------------------------------------------------
   * Metadata
   * ----------------------------------------------------------------------- */

  /**
   * Custom application metadata.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;

  readonly instrumentation?: InstrumentationOptions;
}

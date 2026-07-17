import type { ModuleType } from "../../bootstrap/types/module.type";
import type { ImportType } from "../../bootstrap/types/import.type";
import type { ProviderType } from "../../bootstrap/types/provider.type";
import type { ExportType } from "../../bootstrap/types/export.type";
import type { ControllerType } from "../../bootstrap/types/controller.type";
import type { MiddlewareType } from "../../bootstrap/types/middleware.type";
import type { GuardType } from "../../bootstrap/types/guard.type";
import type { InterceptorType } from "../../bootstrap/types/interceptor.type";
import type { FilterType } from "../../bootstrap/types/filter.type";

/* =============================================================================
 * Contribution Manifest
 * =============================================================================
 *
 * Declarative description of the infrastructure exposed by a Kernel
 * contribution.
 *
 * The manifest is the single source of truth describing every infrastructure
 * artifact contributed to the Solvia Kernel.
 *
 * It contains no executable behavior and remains immutable throughout the
 * application lifecycle.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • declare NestJS modules
 * • declare dependency graph extensions
 * • declare HTTP infrastructure
 * • provide registry inputs
 * • support discovery and tooling
 *
 * It does NOT:
 *
 * • execute logic
 * • resolve dependencies
 * • instantiate providers
 * • mutate runtime state
 *
 * The manifest is consumed by:
 *
 * • Contribution Loader
 * • Discovery Engine
 * • Registry Engine
 * • Bootstrap Runtime
 * • Diagnostics
 * • Tooling
 *
 * =============================================================================
 */

export interface ContributionManifest {
  /* ===========================================================================
   * Modules
   * ========================================================================= */

  /**
   * NestJS modules exposed by the contribution.
   */
  readonly modules?: readonly ModuleType[];

  /**
   * Imported modules.
   */
  readonly imports?: readonly ImportType[];

  /* ===========================================================================
   * Dependency Injection
   * ========================================================================= */

  /**
   * Providers contributed by this contribution.
   */
  readonly providers?: readonly ProviderType[];

  /**
   * Exported providers or modules.
   */
  readonly exports?: readonly ExportType[];

  /* ===========================================================================
   * HTTP Layer
   * ========================================================================= */

  /**
   * HTTP controllers.
   */
  readonly controllers?: readonly ControllerType[];

  /**
   * Global or scoped middlewares.
   */
  readonly middlewares?: readonly MiddlewareType[];

  /**
   * Guards.
   */
  readonly guards?: readonly GuardType[];

  /**
   * Interceptors.
   */
  readonly interceptors?: readonly InterceptorType[];

  /**
   * Exception filters.
   */
  readonly filters?: readonly FilterType[];

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Immutable manifest metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • tooling
   * • profiling
   * • future Kernel extensions
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

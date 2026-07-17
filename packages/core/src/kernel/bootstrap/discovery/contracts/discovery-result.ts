import type { ImportType } from "../../types/import.type";
import type { ExportType } from "../../types/export.type";
import type { ProviderType } from "../../types/provider.type";
import type { ControllerType } from "../../types/controller.type";
import type { MiddlewareType } from "../../types/middleware.type";
import type { GuardType } from "../../types/guard.type";
import type { InterceptorType } from "../../types/interceptor.type";
import type { FilterType } from "../../types/filter.type";

import type { BootstrapModule } from "../../contracts/bootstrap-module";
/* =============================================================================
 * Discovery Result
 * =============================================================================
 *
 * Immutable snapshot produced by the Discovery phase.
 *
 * DiscoveryResult is the canonical representation of everything discovered by
 * the Kernel before registry normalization.
 *
 * Every discovered artifact is represented using Kernel abstractions rather
 * than raw NestJS types. This keeps the Discovery layer independent from the
 * Registry and Runtime implementations while providing a consistent contract
 * throughout the bootstrap pipeline.
 *
 * Lifecycle
 * -----------------------------------------------------------------------------
 *
 * Bootstrap Discovery
 *          │
 *          ▼
 *    DiscoveryResult
 *          │
 *          ▼
 *    Registry Engine
 *          │
 *          ▼
 *   Registry Snapshot
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • expose discovered bootstrap artifacts
 * • preserve discovery ordering
 * • provide immutable discovery output
 * • serve as Registry Engine input
 *
 * It does NOT:
 *
 * • instantiate modules
 * • register providers
 * • execute lifecycle hooks
 * • mutate bootstrap state
 *
 * =============================================================================
 */

export interface DiscoveryResult {
  /* ===========================================================================
   * Dependency Graph
   * ========================================================================= */

  /**
   * Imported modules discovered during bootstrap.
   */
  readonly imports: readonly ImportType[];

  /**
   * Kernel module descriptors discovered during bootstrap.
   */
  readonly modules: readonly BootstrapModule[];

  /**
   * Discovered providers.
   */
  readonly providers: readonly ProviderType[];

  /**
   * Exported providers or modules.
   */
  readonly exports: readonly ExportType[];

  /* ===========================================================================
   * HTTP Layer
   * ========================================================================= */

  /**
   * Discovered controllers.
   */
  readonly controllers: readonly ControllerType[];

  /**
   * Discovered middleware.
   */
  readonly middlewares: readonly MiddlewareType[];

  /**
   * Discovered guards.
   */
  readonly guards: readonly GuardType[];

  /**
   * Discovered interceptors.
   */
  readonly interceptors: readonly InterceptorType[];

  /**
   * Discovered exception filters.
   */
  readonly filters: readonly FilterType[];
}
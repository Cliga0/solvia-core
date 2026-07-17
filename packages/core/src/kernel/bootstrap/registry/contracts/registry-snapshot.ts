import type { ImportType } from "../../types/import.type";
import type { ProviderType } from "../../types/provider.type";
import type { ExportType } from "../../types/export.type";
import type { MiddlewareType } from "../../types/middleware.type";
import type { GuardType } from "../../types/guard.type";
import type { InterceptorType } from "../../types/interceptor.type";
import type { FilterType } from "../../types/filter.type";

/* =============================================================================
 * Registry Snapshot
 * =============================================================================
 *
 * Immutable representation of the fully assembled Kernel Registry.
 *
 * RegistrySnapshot is the final output produced by the Registry Engine after
 * every registry strategy has executed and their fragments have been merged.
 *
 * It represents the normalized infrastructure graph that will be consumed by
 * the Runtime Builder to construct the Bootstrap Runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • expose normalized imports
 * • expose normalized providers
 * • expose normalized exports
 * • expose middleware registrations
 * • expose guard registrations
 * • expose interceptor registrations
 * • expose filter registrations
 *
 * Guarantees
 * -----------------------------------------------------------------------------
 *
 * • immutable
 * • deterministic
 * • duplicate-free
 * • fully normalized
 * • ready for runtime construction
 *
 * RegistrySnapshot never performs any computation.
 * It is a pure data contract owned by the Kernel.
 *
 * =============================================================================
 */

export interface RegistrySnapshot {
  /**
   * Normalized module imports.
   */
  readonly imports: readonly ImportType[];

  /**
   * Normalized providers.
   */
  readonly providers: readonly ProviderType[];

  /**
   * Normalized exports.
   */
  readonly exports: readonly ExportType[];

  /**
   * Registered middlewares.
   */
  readonly middlewares: readonly MiddlewareType[];

  /**
   * Registered guards.
   */
  readonly guards: readonly GuardType[];

  /**
   * Registered interceptors.
   */
  readonly interceptors: readonly InterceptorType[];

  /**
   * Registered exception filters.
   */
  readonly filters: readonly FilterType[];
}

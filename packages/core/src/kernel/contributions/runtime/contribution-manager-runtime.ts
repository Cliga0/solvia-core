import type { ContributionManifest } from "../contracts/contribution-manifest";
import type { ContributionRuntime } from "./contribution-runtime";

import type { ModuleType } from "../../bootstrap/types/module.type";
import type { ImportType } from "../../bootstrap/types/import.type";
import type { ProviderType } from "../../bootstrap/types/provider.type";
import type { ExportType } from "../../bootstrap/types/export.type";
import type { ControllerType } from "../../bootstrap/types/controller.type";
import type { MiddlewareType } from "../../bootstrap/types/middleware.type";
import type { GuardType } from "../../bootstrap/types/guard.type";
import type { InterceptorType } from "../../bootstrap/types/interceptor.type";
import type { FilterType } from "../../bootstrap/types/filter.type";

import { ContributionManagerState } from "../enums/contribution-manager-state.enum";

/* =============================================================================
 * Contribution Manager Runtime
 * =============================================================================
 *
 * Immutable runtime facade exposing every contribution loaded by the Solvia
 * Kernel.
 *
 * The ContributionManagerRuntime is the single public runtime consumed by the
 * bootstrap, registry and discovery subsystems once contribution loading has
 * completed.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • expose loaded contribution runtimes
 * • provide runtime lookup
 * • expose contribution manifests
 * • aggregate bootstrap artifacts
 * • expose lifecycle information
 * • provide immutable diagnostics
 *
 * It does NOT:
 *
 * • discover contributions
 * • execute lifecycle hooks
 * • resolve dependencies
 * • instantiate providers
 * • mutate runtime state
 *
 * =============================================================================
 */

export interface ContributionManagerRuntime {
  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  /**
   * Loaded contribution runtimes.
   */
  readonly contributions: readonly ContributionRuntime[];

  /**
   * Number of loaded contributions.
   */
  readonly count: number;

  /**
   * Returns every loaded runtime.
   */
  all(): readonly ContributionRuntime[];

  /**
   * Returns one runtime.
   */
  runtime(name: string): ContributionRuntime | undefined;

  /**
   * Indicates whether a runtime exists.
   */
  has(name: string): boolean;

  /* ===========================================================================
   * Manifest
   * ========================================================================= */

  /**
   * Returns every contribution manifest.
   */
  manifests(): readonly ContributionManifest[];

  /**
   * Returns one contribution manifest.
   */
  manifest(name: string): ContributionManifest | undefined;

  /* ===========================================================================
   * Aggregated Bootstrap Artifacts
   * ========================================================================= */

  /**
   * Aggregated NestJS modules.
   */
  modules(): readonly ModuleType[];

  /**
   * Aggregated imported modules.
   */
  imports(): readonly ImportType[];

  /**
   * Aggregated providers.
   */
  providers(): readonly ProviderType[];

  /**
   * Aggregated exported providers/modules.
   */
  exports(): readonly ExportType[];

  /**
   * Aggregated controllers.
   */
  controllers(): readonly ControllerType[];

  /**
   * Aggregated middlewares.
   */
  middlewares(): readonly MiddlewareType[];

  /**
   * Aggregated guards.
   */
  guards(): readonly GuardType[];

  /**
   * Aggregated interceptors.
   */
  interceptors(): readonly InterceptorType[];

  /**
   * Aggregated exception filters.
   */
  filters(): readonly FilterType[];

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Current manager lifecycle state.
   */
  readonly state: ContributionManagerState;

  /**
   * Startup timestamp.
   */
  readonly startedAt: Date;

  /**
   * Shutdown timestamp.
   */
  readonly stoppedAt?: Date;

  /**
   * Total execution duration.
   */
  readonly duration?: number;

  /**
   * Startup or shutdown failure.
   */
  readonly error?: Error;

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Immutable runtime metadata.
   */
  readonly metadata: Readonly<Record<string, unknown>>;

  /**
   * Returns an immutable runtime snapshot.
   */
  snapshot(): Readonly<{
    contributions: readonly ContributionRuntime[];
    manifests: readonly ContributionManifest[];
    state: ContributionManagerState;
    startedAt: Date;
    stoppedAt?: Date;
    duration?: number;
    error?: Error;
    metadata: Readonly<Record<string, unknown>>;
  }>;
}

import type { BootstrapContext } from "../../contracts/bootstrap-context";
import type { BootstrapPhase } from "../../contracts/bootstrap-phase";

import type { BootstrapProfile } from "../../enums/bootstrap-profile.enum";
import type { BootstrapFeature } from "../../enums/bootstrap-feature.enum";

import type { DiscoveryResult } from "../../discovery/contracts/discovery-result";
import type { RegistrySnapshot } from "../../registry/contracts/registry-snapshot";

import type { ContributionManagerRuntime } from "../../../contributions/runtime/contribution-manager-runtime";

/* =============================================================================
 * Bootstrap Runtime
 * =============================================================================
 *
 * Immutable operational runtime produced after successful Kernel bootstrap.
 *
 * BootstrapRuntime represents the final state of the Kernel after:
 *
 *  - contribution loading
 *  - discovery
 *  - registry construction
 *  - pipeline execution
 *
 * It is the runtime boundary exposed after bootstrap completion.
 *
 * =============================================================================
 */

export interface BootstrapRuntime {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  readonly id: string;

  readonly startedAt: Date;

  /* ===========================================================================
   * Context
   * ========================================================================= */

  /**
   * Immutable bootstrap context snapshot.
   */
  readonly context: BootstrapContext;

  /* ===========================================================================
   * Contributions
   * ========================================================================= */

  /**
   * Loaded contribution runtime.
   */
  readonly contributions: ContributionManagerRuntime;

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  /**
   * Complete discovery graph.
   */
  readonly discovery: DiscoveryResult;

  /* ===========================================================================
   * Registry
   * ========================================================================= */

  /**
   * Final registry snapshot.
   */
  readonly registry: RegistrySnapshot;

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  readonly phases: readonly BootstrapPhase[];

  /* ===========================================================================
   * Environment
   * ========================================================================= */

  readonly profile: BootstrapProfile;

  readonly environment: string;

  readonly version: string;

  /* ===========================================================================
   * Features
   * ========================================================================= */

  readonly features: readonly BootstrapFeature[];
}

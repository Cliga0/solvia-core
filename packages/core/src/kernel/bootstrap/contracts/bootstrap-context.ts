import type { BootstrapOptions } from "./bootstrap-options";
import type { DiscoveryResult } from "../discovery/contracts/discovery-result";
import type { RegistrySnapshot } from "../registry/contracts/registry-snapshot";

import { BootstrapFeature } from "../enums/bootstrap-feature.enum";
import { BootstrapProfile } from "../enums/bootstrap-profile.enum";

import type { BootstrapPhase } from "./bootstrap-phase";

import type { ContributionManagerRuntime } from "../../contributions/runtime/contribution-manager-runtime";
import type { BootstrapRuntime } from "../runtime/contracts/bootstrap-runtime";

/* =============================================================================
 * Bootstrap Context
 * =============================================================================
 *
 * Immutable runtime view of an active Kernel bootstrap session.
 *
 * The BootstrapContext is the single source of truth describing the current
 * bootstrap execution.
 *
 * RuntimeContext implements this contract internally while keeping mutation
 * capabilities private.
 *
 * External components only receive this readonly projection.
 *
 * =============================================================================
 */

export interface BootstrapContext {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  /**
   * Unique bootstrap session identifier.
   */
  readonly id: string;

  /**
   * Bootstrap start timestamp.
   */
  readonly startedAt: Date;

  /**
   * Bootstrap completion timestamp.
   */
  readonly completedAt?: Date;

  /* ===========================================================================
   * Configuration
   * ========================================================================= */

  /**
   * Active bootstrap profile.
   */
  readonly profile: BootstrapProfile;

  /**
   * Enabled kernel features.
   */
  readonly features: ReadonlySet<BootstrapFeature>;

  /**
   * Bootstrap options supplied by the application.
   */
  readonly options: Readonly<BootstrapOptions>;

  /* ===========================================================================
   * Environment
   * ========================================================================= */

  readonly environment: string;

  readonly rootDirectory: string;

  readonly version: string;

  readonly nodeVersion: string;

  readonly architecture: string;

  /* ===========================================================================
   * Runtime Artifacts
   * ========================================================================= */

  /**
   * Loaded contribution manager.
   */
  readonly contributions?: ContributionManagerRuntime;

  /**
   * Discovery graph.
   */
  readonly discovery?: DiscoveryResult;

  /**
   * Final registry snapshot.
   */
  readonly registry?: RegistrySnapshot;

  /**
   * Final immutable Kernel runtime.
   */
  readonly runtime?: BootstrapRuntime;

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Current executing phase.
   */
  readonly currentPhase?: BootstrapPhase;

  /**
   * Executed phases.
   */
  readonly phases: readonly BootstrapPhase[];

  /**
   * Bootstrap completed successfully.
   */
  readonly isReady: boolean;

  /**
   * Bootstrap aborted.
   */
  readonly hasFailed: boolean;

  /**
   * Failure information.
   */
  readonly error?: Error;

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Current elapsed execution time.
   */
  readonly elapsedTime: number;

  /**
   * Final bootstrap duration.
   *
   * Available once bootstrap completes.
   */
  readonly duration?: number;

  /**
   * Optional runtime metadata.
   *
   * Reserved for diagnostics, instrumentation,
   * plugins and future kernel extensions.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

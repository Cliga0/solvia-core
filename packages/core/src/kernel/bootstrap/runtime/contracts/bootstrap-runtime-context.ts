import type { BootstrapContext } from "../../contracts/bootstrap-context";

import type { DiscoveryResult } from "../../discovery/contracts/discovery-result";
import type { RegistrySnapshot } from "../../registry/contracts/registry-snapshot";
import type { BootstrapPhase } from "../../contracts/bootstrap-phase";

import type { KernelContribution } from "../../../contributions/contracts/kernel-contribution";
import type { ContributionManagerRuntime } from "../../../contributions/runtime/contribution-manager-runtime";
import type { ContributionCatalog } from "../../../contributions/registry/contribution.catalog";

import type { PipelineResult } from "../../pipeline/contracts/pipeline-result";
import type { BootstrapRuntime } from "./bootstrap-runtime";

/* =============================================================================
 * Bootstrap Runtime Context
 * =============================================================================
 *
 * Mutable execution context owned by the Bootstrap Engine.
 *
 * This interface represents the internal mutation boundary of the bootstrap
 * lifecycle.
 *
 * It extends BootstrapContext, which remains the immutable runtime projection.
 *
 *
 * Lifecycle:
 *
 * Bootstrap
 *      |
 *      v
 * BootstrapRuntimeContext
 *      |
 *      +--> resolved contributions
 *      |
 *      +--> contribution catalog
 *      |
 *      +--> contribution runtime
 *      |
 *      +--> discovery result
 *      |
 *      +--> registry snapshot
 *
 *
 * Responsibilities:
 *
 * • Store bootstrap intermediate artifacts
 * • Expose controlled mutation operations
 * • Provide runtime services required by bootstrap actions
 *
 *
 * Does NOT:
 *
 * • Execute bootstrap phases
 * • Resolve dependencies
 * • Load contributions
 * • Own orchestration logic
 *
 * =============================================================================
 */

export interface BootstrapRuntimeContext extends BootstrapContext {
  /* ===========================================================================
   * Contribution Resolution
   * ========================================================================= */

  /**
   * Attach contributions resolved by ContributionResolver.
   */
  attachResolvedContributions(
    contributions: readonly KernelContribution[],
  ): this;

  /**
   * Retrieve resolved contributions.
   *
   * Used by LoadContributionsAction.
   */
  resolvedContributions(): readonly KernelContribution[];

  /* ===========================================================================
   * Contribution Infrastructure
   * ========================================================================= */

  /**
   * Provide contribution catalog.
   *
   * The catalog is created before contribution loading
   * and shared during bootstrap execution.
   */
  contributionCatalog(): ContributionCatalog;

  /**
   * Attach loaded contribution runtime.
   */
  attachContributions(contributions: ContributionManagerRuntime): this;

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  /**
   * Attach discovery result.
   */
  attachDiscovery(discovery: DiscoveryResult): this;

  /**
   * Retrieve discovery result.
   *
   * Named differently from BootstrapContext.discovery
   * to avoid contract collision.
   */
  getDiscovery(): DiscoveryResult | undefined;

  /* ===========================================================================
   * Registry
   * ========================================================================= */

  /**
   * Attach registry snapshot.
   */
  attachRegistry(registry: RegistrySnapshot): this;

  /**
   * Retrieve registry snapshot.
   *
   * Named differently from BootstrapContext.registry
   * to avoid contract collision.
   */
  getRegistry(): RegistrySnapshot | undefined;

  /* ===========================================================================
   * Pipeline Lifecycle
   * ========================================================================= */

  /**
   * Enter active phase.
   */
  enterPhase(phase: BootstrapPhase): this;

  /**
   * Mark phase completed.
   */
  completePhase(phase: BootstrapPhase): this;

  /**
   * Mark phase failed.
   */
  failPhase(phase: BootstrapPhase, error: unknown): this;

  /* ===========================================================================
   * Pipeline Result
   * ========================================================================= */

  /**
   * Attach pipeline execution result.
   */
  attachPipeline(result: PipelineResult): this;

  /**
   * Retrieve pipeline execution result.
   */
  pipeline(): PipelineResult | undefined;

  /* ===========================================================================
   * Runtime Lifecycle
   * ========================================================================= */

  /**
   * Mark bootstrap successful.
   */
  markReady(): this;

  /**
   * Mark bootstrap failed.
   */
  markFailed(error: Error): this;

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  /**
   * Attach final immutable bootstrap runtime.
   */
  attachRuntime(runtime: BootstrapRuntime): this;
}

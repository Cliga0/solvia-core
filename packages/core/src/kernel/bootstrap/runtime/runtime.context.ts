import { randomUUID } from "node:crypto";
import os from "node:os";
import process from "node:process";

import type { BootstrapOptions } from "../contracts/bootstrap-options";
import type { BootstrapRuntimeContext } from "./contracts/bootstrap-runtime-context";
import type { BootstrapContext } from "../contracts/bootstrap-context";
import type { DiscoveryResult } from "../discovery/contracts/discovery-result";
import type { RegistrySnapshot } from "../registry/contracts/registry-snapshot";
import type { BootstrapPhase } from "../contracts/bootstrap-phase";

import type { ContributionManagerRuntime } from "../../contributions/runtime/contribution-manager-runtime";

import { BootstrapFeature } from "../enums/bootstrap-feature.enum";
import { BootstrapProfile } from "../enums/bootstrap-profile.enum";

import type { KernelContribution } from "../../contributions/contracts/kernel-contribution";

import { ContributionCatalog } from "../../contributions/registry/contribution.catalog";

import type { PipelineResult } from "../pipeline/contracts/pipeline-result";
import type { BootstrapRuntime } from "./contracts/bootstrap-runtime";

import type { RuntimeMetadata } from "./contracts/runtime-metadata";

/* =============================================================================
 * Runtime Context
 * =============================================================================
 *
 * Mutable bootstrap state shared by every bootstrap subsystem.
 *
 * RuntimeContext is the single source of truth during Kernel startup.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Bootstrap identity
 * • Runtime configuration
 * • Environment information
 * • Bootstrap artifacts
 * • Lifecycle state
 * • Phase tracking
 * • Diagnostics
 *
 * Once bootstrap completes, RuntimeBuilder transforms this mutable context
 * into an immutable BootstrapRuntime.
 *
 * =============================================================================
 */

export class RuntimeContext implements BootstrapRuntimeContext {
  public static create(options: BootstrapOptions = {}): RuntimeContext {
    return new RuntimeContext(options);
  }

  /* ===========================================================================
   * Identity
   * ========================================================================= */

  public readonly id = randomUUID();

  public readonly startedAt = new Date();

  /* ===========================================================================
   * Configuration
   * ========================================================================= */

  public readonly options: Readonly<BootstrapOptions>;

  public readonly profile: BootstrapProfile;

  public readonly features: ReadonlySet<BootstrapFeature>;

  /* ===========================================================================
   * Environment
   * ========================================================================= */

  public readonly environment = process.env.NODE_ENV ?? "development";

  public readonly rootDirectory = process.cwd();

  public readonly version = process.env.npm_package_version ?? "0.0.0";

  public readonly nodeVersion = process.version;

  public readonly architecture = os.arch();

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  public readonly metadata: RuntimeMetadata;

  /* ===========================================================================
   * Bootstrap Artifacts
   * ========================================================================= */

  private discoveryResult?: DiscoveryResult;

  private contributionManager?: ContributionManagerRuntime;

  private registrySnapshot?: RegistrySnapshot;

  private bootstrapRuntime?: BootstrapRuntime;

  /**
   * Contributions resolved by ContributionResolver.
   */
  private resolvedContributionList: readonly KernelContribution[] = [];

  /**
   * Contribution registry.
   */
  private readonly catalog: ContributionCatalog;

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  private ready = false;

  private failed = false;

  private failure?: Error;

  private _completedAt?: Date;

  /* ===========================================================================
   * Pipeline
   * ========================================================================= */

  private current?: BootstrapPhase;

  private readonly completedPhases = new Set<BootstrapPhase>();

  private readonly phaseStarted = new Map<BootstrapPhase, number>();

  private pipelineResult?: PipelineResult;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor(options: BootstrapOptions = {}) {
    this.options = Object.freeze({
      ...options,
    });

    this.profile = options.profile ?? BootstrapProfile.API;

    this.features = new Set(options.features ?? []);

    this.metadata = Object.freeze(options.metadata ?? {});

    this.catalog = ContributionCatalog.create();
  }

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  public attachDiscovery(discovery: DiscoveryResult): this {
    this.discoveryResult = discovery;

    return this;
  }

  public getDiscovery(): DiscoveryResult | undefined {
    return this.discoveryResult;
  }

  public get discovery(): DiscoveryResult | undefined {
    return this.discoveryResult;
  }

  /* ===========================================================================
   * Contribution Resolution
   * ========================================================================= */

  public attachResolvedContributions(
    contributions: readonly KernelContribution[],
  ): this {
    this.resolvedContributionList = Object.freeze([...contributions]);

    return this;
  }

  public resolvedContributions(): readonly KernelContribution[] {
    return this.resolvedContributionList;
  }

  public contributionCatalog(): ContributionCatalog {
    return this.catalog;
  }

  /* ===========================================================================
   * Contributions
   * ========================================================================= */

  public attachContributions(contributions: ContributionManagerRuntime): this {
    this.contributionManager = contributions;
    return this;
  }

  public get contributions(): ContributionManagerRuntime | undefined {
    return this.contributionManager;
  }

  /* ===========================================================================
   * Registry
   * ========================================================================= */

  public attachRegistry(registry: RegistrySnapshot): this {
    this.registrySnapshot = registry;

    return this;
  }

  public getRegistry(): RegistrySnapshot | undefined {
    return this.registrySnapshot;
  }

  public get registry(): RegistrySnapshot | undefined {
    return this.registrySnapshot;
  }

  /* ===========================================================================
   * Pipeline
   * ========================================================================= */

  public enterPhase(phase: BootstrapPhase): this {
    this.current = phase;

    this.phaseStarted.set(phase, Date.now());

    return this;
  }

  public completePhase(phase: BootstrapPhase): this {
    this.completedPhases.add(phase);

    return this;
  }

  public failPhase(phase: BootstrapPhase, error: unknown): this {
    this.completedPhases.add(phase);

    this.markFailed(error instanceof Error ? error : new Error(String(error)));

    return this;
  }

  public get currentPhase(): BootstrapPhase | undefined {
    return this.current;
  }

  public get phases(): readonly BootstrapPhase[] {
    return [...this.completedPhases];
  }

  public attachPipeline(result: PipelineResult): this {
    this.pipelineResult = result;

    return this;
  }

  public pipeline(): PipelineResult | undefined {
    return this.pipelineResult;
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  public markReady(): this {
    this.ready = true;
    return this;
  }

  public markFailed(error: Error): this {
    this.failed = true;
    this.failure = error;
    return this;
  }

  public markCompleted(): this {
    this._completedAt = new Date();

    return this;
  }

  public get isReady(): boolean {
    return this.ready;
  }

  public get hasFailed(): boolean {
    return this.failed;
  }

  public get error(): Error | undefined {
    return this.failure;
  }

  public get completedAt(): Date | undefined {
    return this._completedAt;
  }

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  public get elapsedTime(): number {
    return Date.now() - this.startedAt.getTime();
  }

  public get memoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  public get cpuUsage(): NodeJS.CpuUsage {
    return process.cpuUsage();
  }

  public attachRuntime(runtime: BootstrapRuntime): this {
    this.bootstrapRuntime = runtime;

    return this;
  }

  public get runtime(): BootstrapRuntime | undefined {
    return this.bootstrapRuntime;
  }

  /* ===========================================================================
   * Snapshot
   * ========================================================================= */

  public snapshot(): BootstrapContext {
    return Object.freeze({
      id: this.id,

      startedAt: this.startedAt,

      completedAt: this.completedAt,

      options: this.options,

      profile: this.profile,

      features: this.features,

      environment: this.environment,

      rootDirectory: this.rootDirectory,

      version: this.version,

      nodeVersion: this.nodeVersion,

      architecture: this.architecture,

      metadata: this.metadata,

      contributions: this.contributions,

      discovery: this.discovery,

      registry: this.registry,

      runtime: this.runtime,

      currentPhase: this.current,

      phases: [...this.completedPhases],

      isReady: this.isReady,

      hasFailed: this.hasFailed,

      error: this.error,

      elapsedTime: this.elapsedTime,
    });
  }
}

import type { ContributionManagerRuntime } from "../runtime/contribution-manager-runtime";
import type { ContributionRuntime } from "../runtime/contribution-runtime";

import { ContributionManagerState } from "../enums/contribution-manager-state.enum";

/* =============================================================================
 * Contribution Manager Runtime Builder
 * =============================================================================
 *
 * Immutable builder responsible for constructing the Contribution Manager
 * runtime exposed by the Kernel.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Build immutable ContributionManagerRuntime
 * • Aggregate contribution manifests
 * • Aggregate bootstrap artifacts
 * • Preserve lifecycle metadata
 * • Expose runtime query APIs
 *
 * Does NOT:
 *
 * • discover contributions
 * • execute lifecycle hooks
 * • mutate contribution runtimes
 * • perform dependency resolution
 *
 * =============================================================================
 */

export class ContributionManagerRuntimeBuilder {
  private constructor(
    private readonly runtimes: readonly ContributionRuntime[],
    private readonly state: ContributionManagerState,
    private readonly startedAt: Date,
    private readonly stoppedAt?: Date,
    private readonly error?: Error,
    private readonly metadata: Readonly<
      Record<string, unknown>
    > = Object.freeze({}),
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    runtimes: readonly ContributionRuntime[],
  ): ContributionManagerRuntimeBuilder {
    return new ContributionManagerRuntimeBuilder(
      Object.freeze([...runtimes]),
      ContributionManagerState.RUNNING,
      new Date(),
    );
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  public withState(
    state: ContributionManagerState,
  ): ContributionManagerRuntimeBuilder {
    return new ContributionManagerRuntimeBuilder(
      this.runtimes,
      state,
      this.startedAt,
      this.stoppedAt,
      this.error,
      this.metadata,
    );
  }

  public stopped(
    stoppedAt: Date = new Date(),
  ): ContributionManagerRuntimeBuilder {
    return new ContributionManagerRuntimeBuilder(
      this.runtimes,
      this.state,
      this.startedAt,
      stoppedAt,
      this.error,
      this.metadata,
    );
  }

  public failed(error: Error): ContributionManagerRuntimeBuilder {
    return new ContributionManagerRuntimeBuilder(
      this.runtimes,
      ContributionManagerState.FAILED,
      this.startedAt,
      this.stoppedAt,
      error,
      this.metadata,
    );
  }

  public withMetadata(
    metadata: Readonly<Record<string, unknown>>,
  ): ContributionManagerRuntimeBuilder {
    return new ContributionManagerRuntimeBuilder(
      this.runtimes,
      this.state,
      this.startedAt,
      this.stoppedAt,
      this.error,
      Object.freeze({
        ...this.metadata,
        ...metadata,
      }),
    );
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(): ContributionManagerRuntime {
    const runtimes = this.runtimes;

    const manifests = Object.freeze(
      runtimes.map((runtime) => runtime.contribution.manifest),
    );

    const duration =
      this.stoppedAt === undefined
        ? undefined
        : this.stoppedAt.getTime() - this.startedAt.getTime();

    const modules = Object.freeze(
      manifests.flatMap((manifest) => manifest.modules ?? []),
    );

    const imports = Object.freeze(
      manifests.flatMap((manifest) => manifest.imports ?? []),
    );

    const providers = Object.freeze(
      manifests.flatMap((manifest) => manifest.providers ?? []),
    );

    const exports = Object.freeze(
      manifests.flatMap((manifest) => manifest.exports ?? []),
    );

    const controllers = Object.freeze(
      manifests.flatMap((manifest) => manifest.controllers ?? []),
    );

    const middlewares = Object.freeze(
      manifests.flatMap((manifest) => manifest.middlewares ?? []),
    );

    const guards = Object.freeze(
      manifests.flatMap((manifest) => manifest.guards ?? []),
    );

    const interceptors = Object.freeze(
      manifests.flatMap((manifest) => manifest.interceptors ?? []),
    );

    const filters = Object.freeze(
      manifests.flatMap((manifest) => manifest.filters ?? []),
    );

    return Object.freeze({
      contributions: runtimes,

      count: runtimes.length,

      state: this.state,

      startedAt: this.startedAt,

      stoppedAt: this.stoppedAt,

      duration,

      error: this.error,

      metadata: this.metadata,

      all: (): readonly ContributionRuntime[] => runtimes,

      runtime: (name: string): ContributionRuntime | undefined =>
        runtimes.find((runtime) => runtime.name === name),

      has: (name: string): boolean =>
        runtimes.some((runtime) => runtime.name === name),

      manifests: () => manifests,

      manifest: (name: string) =>
        runtimes.find((runtime) => runtime.name === name)?.contribution
          .manifest,

      modules: () => modules,

      imports: () => imports,

      providers: () => providers,

      exports: () => exports,

      controllers: () => controllers,

      middlewares: () => middlewares,

      guards: () => guards,

      interceptors: () => interceptors,

      filters: () => filters,

      snapshot: () =>
        Object.freeze({
          contributions: runtimes,
          manifests,
          state: this.state,
          startedAt: this.startedAt,
          stoppedAt: this.stoppedAt,
          duration,
          error: this.error,
          metadata: this.metadata,
        }),
    });
  }
}

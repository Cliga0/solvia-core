import type { KernelContribution } from "../contracts/kernel-contribution";
import type { ContributionRuntime } from "../runtime/contribution-runtime";

import { ContributionStatus } from "../enums/contribution-status.enum";

/* =============================================================================
 * Contribution Runtime Builder
 * =============================================================================
 *
 * Immutable builder responsible for creating ContributionRuntime instances.
 *
 * The builder is the single construction entry point for contribution runtimes
 * inside the Kernel.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Build immutable ContributionRuntime objects
 * • Apply lifecycle state
 * • Compute execution duration
 * • Preserve runtime metadata
 * * Guarantee runtime consistency
 *
 * Does NOT:
 *
 * • execute lifecycle hooks
 * • mutate existing runtimes
 * • manage contribution lifecycle
 * • register runtimes
 *
 * =============================================================================
 */

export class ContributionRuntimeBuilder {
  private constructor(
    private readonly contribution: KernelContribution,
    private status: ContributionStatus = ContributionStatus.REGISTERED,
    private startedAt?: Date,
    private stoppedAt?: Date,
    private error?: Error,
    private metadata: Readonly<Record<string, unknown>> = Object.freeze({}),
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    contribution: KernelContribution,
  ): ContributionRuntimeBuilder {
    return new ContributionRuntimeBuilder(
      contribution,
      ContributionStatus.REGISTERED,
      undefined,
      undefined,
      undefined,
      contribution.metadata ?? Object.freeze({}),
    );
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  public registered(): this {
    this.status = ContributionStatus.REGISTERED;

    return this;
  }

  public loading(): this {
    this.status = ContributionStatus.LOADING;

    return this;
  }

  public running(startedAt: Date = new Date()): this {
    this.status = ContributionStatus.RUNNING;

    this.startedAt = startedAt;

    return this;
  }

  public stopped(stoppedAt: Date = new Date()): this {
    this.status = ContributionStatus.STOPPED;

    this.stoppedAt = stoppedAt;

    return this;
  }

  public failed(error: Error, stoppedAt: Date = new Date()): this {
    this.status = ContributionStatus.FAILED;

    this.error = error;

    this.stoppedAt = stoppedAt;

    return this;
  }

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  public withMetadata(metadata: Readonly<Record<string, unknown>>): this {
    this.metadata = Object.freeze({
      ...this.metadata,
      ...metadata,
    });

    return this;
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(): ContributionRuntime {
    const duration =
      this.startedAt && this.stoppedAt
        ? this.stoppedAt.getTime() - this.startedAt.getTime()
        : undefined;

    return Object.freeze({
      name: this.contribution.name,

      contribution: this.contribution,

      status: this.status,

      startedAt: this.startedAt,

      stoppedAt: this.stoppedAt,

      duration,

      error: this.error,

      metadata: this.metadata,
    });
  }
}

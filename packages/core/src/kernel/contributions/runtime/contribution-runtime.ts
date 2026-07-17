import type { KernelContribution } from "../contracts/kernel-contribution";

import { ContributionStatus } from "../enums/contribution-status.enum";

/* =============================================================================
 * Contribution Runtime
 * =============================================================================
 *
 * Immutable runtime representation of a single Kernel Contribution.
 *
 * A KernelContribution describes what a contribution is.
 *
 * A ContributionRuntime describes how that contribution exists while the
 * Kernel is running.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Represent contribution execution state
 * • Track lifecycle progression
 * • Store activation timestamps
 * • Expose diagnostics
 * • Provide runtime metadata
 *
 * The runtime is fully owned by the Kernel.
 * Contributions must never mutate it directly.
 *
 * =============================================================================
 */

export interface ContributionRuntime {
  /**
   * ---------------------------------------------------------------------------
   * Stable contribution identifier.
   *
   * Example:
   *
   * auth
   * database
   * metrics
   *
   * ---------------------------------------------------------------------------
   */
  readonly name: string;

  /**
   * ---------------------------------------------------------------------------
   * Source contribution definition.
   *
   * ---------------------------------------------------------------------------
   */
  readonly contribution: KernelContribution;

  /**
   * ---------------------------------------------------------------------------
   * Current lifecycle status.
   *
   * ---------------------------------------------------------------------------
   */
  readonly status: ContributionStatus;

  /**
   * ---------------------------------------------------------------------------
   * Activation timestamp.
   *
   * Set once the contribution begins initialization.
   *
   * ---------------------------------------------------------------------------
   */
  readonly startedAt?: Date;

  /**
   * ---------------------------------------------------------------------------
   * Shutdown timestamp.
   *
   * Present only after the contribution has stopped.
   *
   * ---------------------------------------------------------------------------
   */
  readonly stoppedAt?: Date;

  /**
   * ---------------------------------------------------------------------------
   * Total execution duration in milliseconds.
   *
   * Available after shutdown or failure.
   *
   * ---------------------------------------------------------------------------
   */
  readonly duration?: number;

  /**
   * ---------------------------------------------------------------------------
   * Failure captured during lifecycle execution.
   *
   * Undefined when execution completed successfully.
   *
   * ---------------------------------------------------------------------------
   */
  readonly error?: Error;

  /**
   * ---------------------------------------------------------------------------
   * Immutable runtime metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • instrumentation
   * • telemetry
   * • profiling
   * * tooling
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

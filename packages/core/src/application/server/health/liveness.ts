/* =============================================================================
 * Liveness Checker
 * =============================================================================
 *
 * Determines whether the application process is alive.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate runtime lifecycle
 * • Execute runtime liveness indicators
 * • Aggregate liveness state
 * • Produce an immutable health report
 *
 * Liveness answers:
 *
 * "Should this process continue running?"
 *
 * Unlike readiness, liveness ignores infrastructure availability.
 * Only fatal runtime failures should make the process unhealthy.
 *
 * =============================================================================
 */

import { ServerState } from "../server.lifecycle";

import { ServerHealthContext } from "./server-health.context";

import { HealthIndicator, HealthStatus } from "./health-indicator";
import { HealthReport } from "./health-result";

export class LivenessChecker {
  private constructor(
    private readonly context: ServerHealthContext,

    private readonly indicators: readonly HealthIndicator[],
  ) {}

  /**
   * Factory.
   */
  public static create(
    context: ServerHealthContext,
    indicators: readonly HealthIndicator[] = [],
  ): LivenessChecker {
    return new LivenessChecker(context, indicators);
  }

  /**
   * Returns a new checker with an additional indicator.
   */
  public add(indicator: HealthIndicator): LivenessChecker {
    return new LivenessChecker(this.context, [...this.indicators, indicator]);
  }

  /**
   * Executes the liveness probe.
   */
  public async check(): Promise<HealthReport> {
    const started = Date.now();

    const snapshot = this.context.snapshot();

    /**
     * A failed or stopped process is no longer alive.
     */
    if (
      snapshot.state === ServerState.FAILED ||
      snapshot.state === ServerState.STOPPED
    ) {
      return Object.freeze({
        status: HealthStatus.UNHEALTHY,

        timestamp: new Date(),

        duration: Date.now() - started,

        checks: [],
      });
    }

    const checks = await Promise.all(
      this.indicators.map((indicator) => this.execute(indicator)),
    );

    return Object.freeze({
      status: this.resolveStatus(checks),

      timestamp: new Date(),

      duration: Date.now() - started,

      checks,
    });
  }

  /**
   * Executes one indicator safely.
   */
  private async execute(indicator: HealthIndicator) {
    try {
      return await indicator.check();
    } catch (error) {
      return {
        name: indicator.name,

        status: HealthStatus.UNHEALTHY,

        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Aggregates liveness state.
   */
  private resolveStatus(
    checks: readonly { status: HealthStatus }[],
  ): HealthStatus {
    if (checks.some((check) => check.status === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    if (checks.some((check) => check.status === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}

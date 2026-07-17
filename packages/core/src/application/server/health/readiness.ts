/* =============================================================================
 * Readiness Checker
 * =============================================================================
 *
 * Determines whether the application is ready to receive traffic.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate server runtime state
 * • Execute readiness indicators
 * • Aggregate health results
 * • Produce an immutable readiness report
 *
 * Readiness answers:
 *
 * "Can this server safely receive traffic?"
 *
 * A server that is not RUNNING is never considered ready,
 * regardless of individual health indicators.
 *
 * =============================================================================
 */

import { ServerState } from "../server.lifecycle";

import { ServerHealthContext } from "./server-health.context";

import { HealthIndicator, HealthStatus } from "./health-indicator";
import { HealthReport } from "./health-result";

export class ReadinessChecker {
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
  ): ReadinessChecker {
    return new ReadinessChecker(context, indicators);
  }

  /**
   * Returns a new checker with an additional indicator.
   */
  public add(indicator: HealthIndicator): ReadinessChecker {
    return new ReadinessChecker(this.context, [
      ...this.indicators,
      indicator,
    ]);
  }

  /**
   * Executes readiness evaluation.
   */
  public async check(): Promise<HealthReport> {
    const started = Date.now();

    const snapshot = this.context.snapshot();

    /**
     * Server is not yet able to receive traffic.
     */
    if (snapshot.state !== ServerState.RUNNING) {
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
   * Aggregates readiness state.
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
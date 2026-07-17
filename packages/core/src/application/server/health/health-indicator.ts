/* =============================================================================
 * Health Indicator Contract
 * =============================================================================
 *
 * Defines a component capable of reporting its health state.
 *
 * Any infrastructure component can implement this contract:
 *
 * - Database
 * - Cache
 * - Queue
 * - External API
 * - Storage
 *
 * =============================================================================
 */

export enum HealthStatus {
  HEALTHY = "healthy",

  UNHEALTHY = "unhealthy",

  DEGRADED = "degraded",
}

export interface HealthCheckResult {
  /**
   * Component identifier.
   */
  readonly name: string;

  /**
   * Current state.
   */
  readonly status: HealthStatus;

  /**
   * Optional latency.
   */
  readonly latency?: number;

  /**
   * Additional information.
   */
  readonly details?: Record<string, unknown>;

  /**
   * Failure reason.
   */
  readonly error?: string;
}

export interface HealthIndicator {
  /**
   * Unique identifier.
   */
  readonly name: string;

  /**
   * Execute health check.
   */
  check(): Promise<HealthCheckResult>;
}

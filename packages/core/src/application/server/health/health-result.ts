/* =============================================================================
 * Health Result
 * =============================================================================
 */

import { HealthCheckResult, HealthStatus } from "./health-indicator";

export interface HealthReport {
  readonly status: HealthStatus;

  readonly timestamp: Date;

  readonly duration: number;

  readonly checks: readonly HealthCheckResult[];
}

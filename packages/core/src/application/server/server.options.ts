/* =============================================================================
 * Server Options
 * =============================================================================
 *
 * Immutable configuration contract for the application server subsystem.
 *
 * Responsibilities:
 *
 * - Define server runtime configuration
 * - Provide strong typing
 * - Separate configuration from execution
 *
 * This contract is consumed by:
 *
 * - ApplicationServer
 * - ServerLifecycle
 * - GracefulShutdown
 * - Health subsystem
 *
 * It MUST NOT:
 *
 * - start the server
 * - access NestJS
 * - access environment variables directly
 * - contain runtime logic
 *
 * =============================================================================
 */

/**
 * Health subsystem configuration.
 */
export interface ServerHealthOptions {
  /**
   * Enable health endpoints.
   */
  readonly enabled?: boolean;

  /**
   * Enable readiness checks.
   */
  readonly readiness?: boolean;

  /**
   * Enable liveness checks.
   */
  readonly liveness?: boolean;
}

/**
 * Graceful shutdown configuration.
 */
export interface ServerShutdownOptions {
  /**
   * Enable OS signal listeners.
   *
   * SIGTERM
   * SIGINT
   */
  readonly enabled?: boolean;

  /**
   * Maximum shutdown duration.
   *
   * Prevents hanging processes.
   */
  readonly timeoutMs?: number;
}

/**
 * Main server configuration.
 */
export interface ServerOptions {
  /**
   * Network host.
   *
   * Example:
   *
   * 0.0.0.0
   */
  readonly host: string;

  /**
   * Network port.
   *
   * Example:
   *
   * 3000
   */
  readonly port: number;

  /**
   * Shutdown configuration.
   */
  readonly shutdown?: ServerShutdownOptions;

  /**
   * Health configuration.
   */
  readonly health?: ServerHealthOptions;

  /**
   * Optional server name.
   *
   * Useful for:
   *
   * - telemetry
   * - logs
   * - metrics
   */
  readonly name?: string;

  /**
   * Runtime metadata.
   *
   * Extension point.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

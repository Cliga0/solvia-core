/* =============================================================================
 * Shutdown Priority
 * =============================================================================
 *
 * Defines the execution order of graceful shutdown hooks.
 *
 * Hooks with higher priority execute before hooks with lower priority.
 *
 * The objective is to shutdown the runtime in a deterministic,
 * predictable and infrastructure-safe order.
 *
 * Shutdown order (highest → lowest)
 *
 *   SERVER
 *      ↓
 *   INSTRUMENTATION
 *      ↓
 *   APPLICATION
 *      ↓
 *   DATABASE
 *      ↓
 *   CACHE
 *      ↓
 *   WORKERS
 *      ↓
 *   DEFAULT
 *
 * =============================================================================
 */

export const ShutdownPriority = {
  /**
   * Stop accepting incoming traffic.
   */
  SERVER: 1000,

  /**
   * Flush telemetry, traces, metrics and logs.
   */
  INSTRUMENTATION: 900,

  /**
   * Shutdown application services.
   */
  APPLICATION: 700,

  /**
   * Close persistent data stores.
   */
  DATABASE: 500,

  /**
   * Disconnect cache providers.
   */
  CACHE: 400,

  /**
   * Stop background workers.
   */
  WORKERS: 300,

  /**
   * Default execution priority.
   */
  DEFAULT: 0,
} as const;

export type ShutdownPriority =
  (typeof ShutdownPriority)[keyof typeof ShutdownPriority];

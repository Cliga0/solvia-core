/* =============================================================================
 * Bootstrap Execution Mode
 * =============================================================================
 *
 * Defines how the Bootstrap Executor schedules phase execution.
 *
 * This enum represents execution strategy only.
 *
 * It does NOT:
 *
 * • define bootstrap phases
 * • execute actions
 * • resolve dependencies
 *
 * The Bootstrap Executor interprets this value.
 *
 * =============================================================================
 */

export enum BootstrapExecutionMode {
  /**
   * ---------------------------------------------------------------------------
   * Sequential execution.
   *
   * Every phase executes one after another following the execution plan order.
   *
   * Example:
   *
   * initialize
   *      |
   *      v
   * resolve-contributions
   *      |
   *      v
   * discovery
   *
   * ---------------------------------------------------------------------------
   */
  SEQUENTIAL = "sequential",

  /**
   * ---------------------------------------------------------------------------
   * Parallel execution.
   *
   * Independent phases may be executed concurrently.
   *
   * Requires dependency analysis from the execution graph.
   *
   * Example:
   *
   *             initialize
   *                 |
   *        +--------+--------+
   *        |                 |
   *   diagnostics       telemetry
   *
   * ---------------------------------------------------------------------------
   */
  PARALLEL = "parallel",

  /**
   * ---------------------------------------------------------------------------
   * Controlled execution.
   *
   * Uses a scheduler capable of:
   *
   * • dependency resolution
   * • priorities
   * • resource limits
   * • dynamic scheduling
   *
   * Reserved for advanced Kernel runtimes.
   *
   * ---------------------------------------------------------------------------
   */
  SCHEDULED = "scheduled",
}

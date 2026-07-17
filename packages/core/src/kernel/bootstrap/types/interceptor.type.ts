/* =============================================================================
 * Interceptor Contract
 * =============================================================================
 *
 * Minimal execution interception capability understood by the Solvia Kernel.
 *
 * Framework adapters are responsible for mapping their native interceptor
 * implementations to this contract.
 *
 * =============================================================================
 */

export interface InterceptorContract {
  /**
   * Intercepts execution flow.
   *
   * @param context Current execution context.
   * @param next Next execution handler.
   */
  intercept(context: unknown, next: unknown): unknown | Promise<unknown>;
}

/* =============================================================================
 * Interceptor Type
 * =============================================================================
 *
 * Kernel-level interceptor constructor reference.
 *
 * =============================================================================
 */

export type InterceptorType = abstract new (
  ...args: unknown[]
) => InterceptorContract;

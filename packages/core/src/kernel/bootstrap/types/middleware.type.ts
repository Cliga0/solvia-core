/* =============================================================================
 * Middleware Contract
 * =============================================================================
 *
 * Minimal request pipeline capability understood by the Solvia Kernel.
 *
 * Framework adapters are responsible for mapping their native middleware
 * implementations to this contract.
 *
 * =============================================================================
 */

export interface MiddlewareContract {
  /**
   * Handles an incoming execution flow.
   *
   * @param request Incoming request context.
   * @param response Outgoing response context.
   * @param next Continue execution callback.
   */
  handle(
    request: unknown,
    response: unknown,
    next: () => void,
  ): unknown | Promise<unknown>;
}

/* =============================================================================
 * Middleware Type
 * =============================================================================
 *
 * Kernel-level middleware constructor reference.
 *
 * =============================================================================
 */

export type MiddlewareType = abstract new (
  ...args: unknown[]
) => MiddlewareContract;

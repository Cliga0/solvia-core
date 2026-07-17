/* =============================================================================
 * Controller Contract
 * =============================================================================
 *
 * Kernel-level controller marker.
 *
 * =============================================================================
 */

export interface ControllerContract {
  readonly __controllerBrand: unique symbol;
}

/* =============================================================================
 * Controller Type
 * =============================================================================
 */

export type ControllerType = abstract new (
  ...args: unknown[]
) => ControllerContract;

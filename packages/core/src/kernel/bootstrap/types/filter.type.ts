/* =============================================================================
 * Filter Contract
 * =============================================================================
 *
 * Marker contract representing an exception handling capability.
 *
 * The execution model belongs to adapters.
 *
 * =============================================================================
 */

export interface FilterContract {
  readonly kind: "filter";
}

/* =============================================================================
 * Filter Type
 * =============================================================================
 *
 * Kernel-level exception filter reference.
 *
 * =============================================================================
 */

export type FilterType = abstract new (...args: unknown[]) => FilterContract;

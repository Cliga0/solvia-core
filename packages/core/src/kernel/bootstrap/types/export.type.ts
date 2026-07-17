/* =============================================================================
 * Export Contract
 * =============================================================================
 *
 * Marker contract for runtime capabilities exposed by a module.
 *
 * =============================================================================
 */

export interface ExportContract {
  readonly __exportBrand: symbol;
}

/* =============================================================================
 * Export Type
 * =============================================================================
 *
 * Kernel-level exported capability reference.
 *
 * =============================================================================
 */

export type ExportType =
  | ExportContract
  | (abstract new (...args: unknown[]) => unknown)
  | string
  | symbol;

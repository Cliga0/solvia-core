import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Sorter
 * =============================================================================
 *
 * Provides deterministic ordering for Kernel contribution definitions.
 *
 * This sorter operates only after dependency resolution.
 *
 * Its responsibility is not to decide dependency order.
 * Its responsibility is to guarantee deterministic ordering when several
 * contributions are eligible for execution.
 *
 *
 * Ordering strategy:
 *
 *      priority
 *          |
 *          v
 *      explicit order
 *          |
 *          v
 *      contribution name
 *
 *
 * Does NOT:
 *
 * • resolve dependencies
 * • detect cycles
 * • build dependency graphs
 * • instantiate contributions
 * • execute lifecycle
 *
 * =============================================================================
 */

export abstract class ContributionSorter {
  /**
   * ---------------------------------------------------------------------------
   * Sort resolved contribution definitions.
   * ---------------------------------------------------------------------------
   */
  public static sort(
    contributions: readonly KernelContribution[],
  ): readonly KernelContribution[] {
    return Object.freeze([...contributions].sort(this.compare));
  }

  /* ===========================================================================
   * Comparator
   * ========================================================================= */

  private static compare(
    left: KernelContribution,
    right: KernelContribution,
  ): number {
    return left.name.localeCompare(right.name);
  }
}

import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Constructor Type
 * =============================================================================
 *
 * Runtime constructor accepted by the Kernel.
 *
 * The Kernel instantiates only concrete contribution implementations.
 *
 * =============================================================================
 */

export type ContributionConstructor = new (
  ...args: never[]
) => KernelContribution;

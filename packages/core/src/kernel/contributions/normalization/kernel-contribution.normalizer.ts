import type { KernelContribution } from "../contracts/kernel-contribution";

import type { ContributionHooks } from "../lifecycle/contribution.hooks";

/* =============================================================================
 * Kernel Contribution Normalizer
 * =============================================================================
 *
 * Normalizes instantiated Kernel contributions before they enter the runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Normalize identity fields
 * • Normalize dependencies
 * • Normalize metadata
 * • Normalize manifest ownership
 * • Normalize lifecycle hooks
 * • Produce immutable contribution objects
 *
 * Does NOT:
 *
 * • Validate contribution correctness
 * • Resolve dependencies
 * • Execute lifecycle
 * • Create runtime objects
 *
 * =============================================================================
 */

export abstract class KernelContributionNormalizer {
  /**
   * Normalize one contribution.
   */
  public static normalize(
    contribution: KernelContribution,
  ): KernelContribution {
    return Object.freeze({
      name: this.normalizeName(contribution.name),

      version: contribution.version?.trim(),

      description: contribution.description?.trim(),

      dependencies: this.normalizeDependencies(contribution.dependencies),

      manifest: Object.freeze({
        ...contribution.manifest,
      }),

      metadata: Object.freeze({
        ...(contribution.metadata ?? {}),
      }),

      hooks: this.normalizeHooks(contribution.hooks),
    });
  }

  /* ===========================================================================
   * Identity
   * ========================================================================= */

  private static normalizeName(name: string): string {
    return name.trim();
  }

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  private static normalizeDependencies(
    dependencies?: readonly string[],
  ): readonly string[] {
    return Object.freeze(
      [...(dependencies ?? [])]
        .map((dependency) => dependency.trim())
        .filter(Boolean),
    );
  }

  /* ===========================================================================
   * Lifecycle Hooks
   * ========================================================================= */

  private static normalizeHooks(
    hooks?: ContributionHooks,
  ): ContributionHooks | undefined {
    if (!hooks) {
      return undefined;
    }

    return Object.freeze({
      ...hooks,
    });
  }
}

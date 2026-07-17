import type { ContributionDefinition } from "../contracts/contribution-definition";

/* =============================================================================
 * Contribution Normalizer
 * =============================================================================
 *
 * Normalizes Kernel contribution definitions before resolution.
 *
 * The normalizer converts heterogeneous contribution declarations into a
 * predictable immutable representation consumed by the dependency resolver.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Apply default values
 * • Normalize collections
 * • Normalize metadata
 * • Remove unsafe mutable references
 * • Produce immutable definitions
 *
 * Does NOT:
 *
 * • Validate contribution correctness
 * • Resolve dependencies
 * • Detect cycles
 * • Instantiate contributions
 *
 * =============================================================================
 */

export abstract class ContributionNormalizer {
  /**
   * Normalize a collection of contribution definitions.
   */
  public static normalize(
    definitions: readonly ContributionDefinition[],
  ): readonly ContributionDefinition[] {
    return Object.freeze(
      definitions.map((definition) => this.normalizeDefinition(definition)),
    );
  }

  /* ===========================================================================
   * Single definition normalization
   * ========================================================================= */

  private static normalizeDefinition(
    definition: ContributionDefinition,
  ): ContributionDefinition {
    return Object.freeze({
      name: this.normalizeName(definition.name),

      version: definition.version,

      type: definition.type,

      dependencies: Object.freeze([...(definition.dependencies ?? [])]),

      priority: definition.priority ?? 0,

      lazy: definition.lazy ?? false,

      metadata: Object.freeze({
        ...(definition.metadata ?? {}),
      }),
    });
  }

  /* ===========================================================================
   * Name normalization
   * ========================================================================= */

  private static normalizeName(name: string): string {
    return name.trim();
  }
}

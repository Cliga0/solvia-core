import type { ContributionDefinition } from "../../contracts/contribution-definition";

import type { ContributionResolutionContext } from "../../contracts/contribution-resolution-context";

import type { ContributionSource } from "../contribution-source";

/* =============================================================================
 * Package Contribution Source
 * =============================================================================
 *
 * Discovers contribution definitions provided by external packages.
 *
 * Typical discovery targets:
 *
 * • package.json metadata
 * • package exports
 * • package manifests
 * • installed extensions
 *
 *
 * Pipeline position:
 *
 * Package ecosystem
 *        |
 *        v
 * ContributionDefinition[]
 *        |
 *        v
 * ContributionNormalizer
 *
 *
 * Does NOT:
 *
 * • Load package implementations
 * • Instantiate contributions
 * • Validate contracts
 * • Resolve dependencies
 *
 * =============================================================================
 */

export class PackageContributionSource implements ContributionSource {
  /**
   * Source identifier.
   */
  public readonly name = "packages";

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  public resolve(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {
    return Object.freeze([...context.packages]);
  }
}

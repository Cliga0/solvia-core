import type { ContributionDefinition } from "../contracts/contribution-definition";

import type { ContributionResolutionContext } from "../contracts/contribution-resolution-context";

/* =============================================================================
 * Contribution Source
 * =============================================================================
 *
 * Discovers contribution definitions.
 *
 * A source never creates runtime contributions.
 *
 * =============================================================================
 */

export interface ContributionSource {
  /**
   * Discover contribution declarations.
   */
  resolve(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[];
}

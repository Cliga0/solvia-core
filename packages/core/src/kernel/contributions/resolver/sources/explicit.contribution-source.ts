import type { ContributionSource } from "../contribution-source";

import type { ContributionDefinition } from "../../contracts/contribution-definition";

import type { ContributionResolutionContext } from "../../contracts/contribution-resolution-context";

/* =============================================================================
 * Explicit Contribution Source
 * =============================================================================
 *
 * Resolves explicitly registered contribution definitions.
 *
 * Explicit contributions are provided directly by the application/kernel
 * configuration layer.
 *
 * This source only discovers declarations.
 *
 * It never:
 *
 * • instantiates contributions
 * • validates definitions
 * • resolves dependencies
 *
 * =============================================================================
 */

export class ExplicitContributionSource implements ContributionSource {
  public readonly name = "explicit";

  public resolve(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {
    return context.explicit;
  }
}

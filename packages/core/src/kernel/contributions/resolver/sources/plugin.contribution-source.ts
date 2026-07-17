import type { ContributionDefinition } from "../../contracts/contribution-definition";

import type { ContributionResolutionContext } from "../../contracts/contribution-resolution-context";

import type { ContributionSource } from "../contribution-source";

/* =============================================================================
 * Plugin Contribution Source
 * =============================================================================
 *
 * Discovers dynamically loaded plugin contributions.
 *
 * Future sources:
 *
 * • plugin registry
 * • remote extensions
 * • runtime modules
 *
 * =============================================================================
 */

export class PluginContributionSource implements ContributionSource {
  public readonly name = "plugins";

  public resolve(
    _context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {
    return Object.freeze([]);
  }
}

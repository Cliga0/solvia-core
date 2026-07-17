import type { ContributionDefinition } from "../contracts/contribution-definition";
import type { ContributionResolutionContext } from "../contracts/contribution-resolution-context";

import type { ContributionSource } from "./contribution-source";

import { ExplicitContributionSource } from "./sources/explicit.contribution-source";
import { WorkspaceContributionSource } from "./sources/workspace.contribution-source";
import { PackageContributionSource } from "./sources/package.contribution-source";
import { PluginContributionSource } from "./sources/plugin.contribution-source";

/* =============================================================================
 * Contribution Source Resolver
 * =============================================================================
 *
 * Discovers Kernel contribution definitions from registered sources.
 *
 * This is the first stage of the contribution resolution pipeline.
 *
 * Pipeline:
 *
 * Sources
 *    |
 *    v
 * ContributionDefinition[]
 *    |
 *    v
 * Normalizer
 *    |
 *    v
 * Validator
 *    |
 *    v
 * Dependency Resolver
 *    |
 *    v
 * Runtime
 *
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Execute contribution discovery sources
 * • Aggregate definitions
 * • Preserve source boundaries
 * • Guarantee deterministic discovery
 * • Produce immutable output
 *
 *
 * Does NOT:
 *
 * • Normalize definitions
 * • Validate contracts
 * • Instantiate contributions
 * • Resolve dependencies
 * • Execute lifecycle hooks
 *
 * =============================================================================
 */

export class ContributionSourceResolver {
  private constructor() {}

  /* ===========================================================================
   * Registered Sources
   * ========================================================================= */

  private static readonly SOURCES: readonly ContributionSource[] =
    Object.freeze([
      new ExplicitContributionSource(),

      new WorkspaceContributionSource(),

      new PackageContributionSource(),

      new PluginContributionSource(),
    ]);


  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Discover all contribution definitions.
   */
  public static resolve(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {

    const definitions: ContributionDefinition[] = [];


    for (const source of this.SOURCES) {

      const discovered = this.resolveSource(
        source,
        context,
      );

      definitions.push(...discovered);
    }


    return Object.freeze(
      definitions,
    );
  }


  /* ===========================================================================
   * Source Resolution
   * ========================================================================= */

  private static resolveSource(
    source: ContributionSource,
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {

    const definitions = source.resolve(context);


    if (!Array.isArray(definitions)) {
      throw new Error(
        [
          "Invalid contribution source result.",
          `Source "${source.constructor.name}"`,
          "must return an array of ContributionDefinition.",
        ].join(" "),
      );
    }


    return Object.freeze(
      definitions.filter(Boolean),
    );
  }
}
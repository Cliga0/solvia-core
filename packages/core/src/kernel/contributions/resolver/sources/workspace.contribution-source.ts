import type { ContributionDefinition } from "../../contracts/contribution-definition";

import type { ContributionResolutionContext } from "../../contracts/contribution-resolution-context";

import type { ContributionSource } from "../contribution-source";

/* =============================================================================
 * Workspace Contribution Source
 * =============================================================================
 *
 * Discovers contribution definitions from the current workspace.
 *
 * A workspace source represents internal Kernel extensions discovered from:
 *
 * • monorepo packages
 * • workspace manifests
 * • internal modules
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Discover workspace contribution definitions
 * • Return immutable declarations
 *
 *
 * Does NOT:
 *
 * • Instantiate contributions
 * • Normalize definitions
 * • Validate contracts
 * • Resolve dependencies
 *
 * =============================================================================
 */

export class WorkspaceContributionSource implements ContributionSource {
  public readonly name = "workspace";

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  public resolve(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {
    return Object.freeze([...context.workspace]);
  }
}

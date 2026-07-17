import type { ContributionDefinition } from "../contracts/contribution-definition";
import type { KernelContribution } from "../contracts/kernel-contribution";

import { ContributionInstantiator } from "./contribution.instantiator";

import { KernelContributionNormalizer } from "../normalization/kernel-contribution.normalizer";
import { ContributionValidator } from "../validator/contribution.validator";

/* =============================================================================
 * Contribution Factory
 * =============================================================================
 *
 * Creates immutable KernelContribution instances from contribution definitions.
 *
 * The factory represents the boundary between declarative contribution
 * definitions and executable Kernel contributions.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Orchestrate contribution instantiation
 * • Normalize runtime contributions
 * • Validate contribution contracts
 * • Produce immutable runtime objects
 *
 * Does NOT:
 *
 * • Resolve dependencies
 * • Execute lifecycle hooks
 * • Build dependency graphs
 * • Build runtimes
 *
 * =============================================================================
 */

export abstract class ContributionFactory {
  /**
   * ---------------------------------------------------------------------------
   * Creates one Kernel contribution.
   * ---------------------------------------------------------------------------
   */
  public static create(
    definition: ContributionDefinition,
  ): KernelContribution {
    const contribution =
      ContributionInstantiator.instantiate(definition);

    const normalized =
      KernelContributionNormalizer.normalize(contribution);

    ContributionValidator.validate(normalized);

    return Object.freeze(normalized);
  }

  /**
   * ---------------------------------------------------------------------------
   * Creates multiple Kernel contributions.
   * ---------------------------------------------------------------------------
   */
  public static createMany(
    definitions: readonly ContributionDefinition[],
  ): readonly KernelContribution[] {
    const contributions = definitions.map((definition) =>
      this.create(definition),
    );

    return Object.freeze(contributions);
  }
}
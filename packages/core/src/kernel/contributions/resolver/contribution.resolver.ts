import type { BootstrapContext } from "../../bootstrap/contracts/bootstrap-context";

import type { KernelContribution } from "../contracts/kernel-contribution";
import type { ContributionResolutionContext } from "../contracts/contribution-resolution-context";

import type { ContributionDefinition } from "../contracts/contribution-definition";

import { ContributionSourceResolver } from "./contribution.source-resolver";

import { ContributionNormalizer } from "../normalization/contribution.normalizer";

import { ContributionFactory } from "../factory/contribution.factory";

import { ContributionValidator } from "../validator/contribution.validator";

import { DependencyGraph } from "./dependency.graph";
import { DependencyValidator } from "./dependency.validator";
import { DependencyCycleDetector } from "./dependency.cycle-detector";
import { TopologicalSorter } from "./topological-sorter";
import { ContributionSorter } from "./contribution.sorter";

/* =============================================================================
 * Contribution Resolver
 * =============================================================================
 *
 * Kernel contribution resolution pipeline.
 *
 * Transforms discovered contribution definitions into an immutable,
 * dependency-safe execution collection.
 *
 * Pipeline:
 *
 * Source Discovery
 *        |
 *        v
 * Definition Normalization
 *        |
 *        v
 * Contribution Instantiation
 *        |
 *        v
 * Runtime Validation
 *        |
 *        v
 * Dependency Resolution
 *        |
 *        v
 * Deterministic Ordering
 *
 *
 * Does NOT:
 *
 * • Execute lifecycle hooks
 * • Register runtime objects
 * • Build providers
 * • Manage application state
 *
 * =============================================================================
 */

export abstract class ContributionResolver {
  private constructor() {}

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  public static resolve(
    bootstrap: BootstrapContext,
  ): readonly KernelContribution[] {
    const context = this.createContext(bootstrap);

    const definitions = this.discover(context);

    const contributions = this.instantiate(definitions);

    return this.resolveDependencies(contributions);
  }

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  private static discover(
    context: ContributionResolutionContext,
  ): readonly ContributionDefinition[] {
    const definitions = ContributionSourceResolver.resolve(context);

    return ContributionNormalizer.normalize(definitions);
  }

  /* ===========================================================================
   * Instantiation
   * ========================================================================= */

  private static instantiate(
    definitions: readonly ContributionDefinition[],
  ): readonly KernelContribution[] {
    const contributions = ContributionFactory.createMany(definitions);

    ContributionValidator.validateMany(contributions);

    return Object.freeze([...contributions]);
  }

  /* ===========================================================================
   * Dependency Resolution
   * ========================================================================= */

  private static resolveDependencies(
    contributions: readonly KernelContribution[],
  ): readonly KernelContribution[] {
    const graph = DependencyGraph.create(contributions);

    DependencyValidator.validate(graph);

    DependencyCycleDetector.assertNoCycles(graph);
    
    const ordered = TopologicalSorter.sort(graph);

    return Object.freeze(ContributionSorter.sort(ordered));
  }

  /* ===========================================================================
   * Context
   * ========================================================================= */

  private static createContext(
    bootstrap: BootstrapContext,
  ): ContributionResolutionContext {
    return Object.freeze({
      bootstrap,

      environment: bootstrap.environment,

      startedAt: new Date(),

      explicit: Object.freeze([]),

      workspace: Object.freeze([]),

      packages: Object.freeze([]),

      plugins: Object.freeze([]),

      metadata: Object.freeze({}),
    });
  }
}

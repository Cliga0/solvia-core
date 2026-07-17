import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Validator
 * =============================================================================
 *
 * Validates Kernel Contribution integrity.
 *
 * The validator guarantees that a contribution satisfies the Kernel contract
 * before registration and lifecycle execution.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate contribution identity
 * • Validate manifest presence
 * • Validate dependencies format
 * • Validate lifecycle hooks
 * • Validate metadata structure
 *
 * Does NOT:
 *
 * • Resolve dependencies
 * • Detect dependency cycles
 * • Execute lifecycle
 * • Create runtime objects
 *
 * =============================================================================
 */

export abstract class ContributionValidator {
  /**
   * Validate one contribution.
   */
  public static validate(contribution: KernelContribution): void {
    this.assertContribution(contribution);

    this.assertIdentity(contribution);

    this.assertManifest(contribution);

    this.assertDependencies(contribution);

    this.assertHooks(contribution);

    this.assertMetadata(contribution);
  }

  /**
   * Validate multiple contributions.
   */
  public static validateMany(
    contributions: readonly KernelContribution[],
  ): void {
    const names = new Set<string>();

    for (const contribution of contributions) {
      this.validate(contribution);

      if (names.has(contribution.name)) {
        throw new Error(`Duplicate contribution name "${contribution.name}".`);
      }

      names.add(contribution.name);
    }
  }

  /* ===========================================================================
   * Base validation
   * ========================================================================= */

  private static assertContribution(contribution: KernelContribution): void {
    if (!contribution) {
      throw new Error("Contribution cannot be null or undefined.");
    }
  }

  /* ===========================================================================
   * Identity
   * ========================================================================= */

  private static assertIdentity(contribution: KernelContribution): void {
    if (
      typeof contribution.name !== "string" ||
      contribution.name.trim().length === 0
    ) {
      throw new Error("Contribution must define a valid name.");
    }
  }

  /* ===========================================================================
   * Manifest
   * ========================================================================= */

  private static assertManifest(contribution: KernelContribution): void {
    if (!contribution.manifest) {
      throw new Error(
        `Contribution "${contribution.name}" must define a manifest.`,
      );
    }
  }

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  private static assertDependencies(contribution: KernelContribution): void {
    const dependencies = contribution.dependencies ?? [];

    const duplicates = new Set<string>();

    for (const dependency of dependencies) {
      if (typeof dependency !== "string" || dependency.trim().length === 0) {
        throw new Error(
          `Invalid dependency in contribution "${contribution.name}".`,
        );
      }

      if (duplicates.has(dependency)) {
        throw new Error(
          `Duplicate dependency "${dependency}" in contribution "${contribution.name}".`,
        );
      }

      duplicates.add(dependency);
    }
  }

  /* ===========================================================================
   * Hooks
   * ========================================================================= */

  private static assertHooks(contribution: KernelContribution): void {
    const hooks = contribution.hooks;

    if (!hooks) {
      return;
    }

    for (const [name, handler] of Object.entries(hooks)) {
      if (handler !== undefined && typeof handler !== "function") {
        throw new Error(
          `Invalid lifecycle hook "${name}" in contribution "${contribution.name}".`,
        );
      }
    }
  }

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  private static assertMetadata(contribution: KernelContribution): void {
    if (
      contribution.metadata !== undefined &&
      typeof contribution.metadata !== "object"
    ) {
      throw new Error(
        `Invalid metadata for contribution "${contribution.name}".`,
      );
    }
  }
}

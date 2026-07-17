import type { ContributionDefinition } from "../contracts/contribution-definition";
import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Instantiator
 * =============================================================================
 *
 * Instantiates KernelContribution objects from contribution definitions.
 *
 * This class encapsulates the construction strategy used by the Kernel.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Instantiate contribution implementations
 * • Verify runtime instance creation
 * • Wrap construction failures
 *
 * Does NOT:
 *
 * • Normalize contributions
 * • Validate contribution contracts
 * • Resolve dependencies
 * • Execute lifecycle hooks
 * • Build runtimes
 *
 * =============================================================================
 */

export abstract class ContributionInstantiator {
  /**
   * ---------------------------------------------------------------------------
   * Instantiate one contribution.
   * ---------------------------------------------------------------------------
   */
  public static instantiate(
    definition: ContributionDefinition,
  ): KernelContribution {
    try {
      const instance = new definition.type();

      this.assertContribution(instance, definition);

      return instance;
    } catch (error) {
      throw this.createInstantiationError(definition, error);
    }
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  /**
   * Ensures the instantiated object satisfies the minimal runtime contract.
   */
  private static assertContribution(
    instance: unknown,
    definition: ContributionDefinition,
  ): asserts instance is KernelContribution {
    if (typeof instance !== "object" || instance === null) {
      throw new TypeError(
        `Contribution "${definition.name}" did not produce an object.`,
      );
    }

    if (!("name" in instance)) {
      throw new TypeError(
        `Contribution "${definition.name}" is missing property "name".`,
      );
    }

    if (!("manifest" in instance)) {
      throw new TypeError(
        `Contribution "${definition.name}" is missing property "manifest".`,
      );
    }
  }

  /* ===========================================================================
   * Error handling
   * ========================================================================= */

  /**
   * Wraps construction failures with contextual information.
   */
  private static createInstantiationError(
    definition: ContributionDefinition,
    cause: unknown,
  ): Error {
    const error = new Error(
      `Failed to instantiate Kernel contribution "${definition.name}".`,
    );

    if (cause instanceof Error) {
      error.cause = cause;
    }

    return error;
  }
}
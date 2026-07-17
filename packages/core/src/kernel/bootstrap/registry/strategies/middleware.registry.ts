import type { MiddlewareType } from "../../types/middleware.type";

import type { BootstrapContext } from "../../contracts/bootstrap-context";

import type { BootstrapRegistry } from "../contracts/bootstrap-registry";
import type { RegistryFragment } from "../contracts/registry-fragment";

/* =============================================================================
 * Middleware Registry
 * =============================================================================
 *
 * Registry strategy responsible for assembling the Kernel middleware graph.
 *
 * MiddlewareRegistry collects middleware declarations originating from both
 * the Discovery phase and the Contribution Manager, normalizes them and
 * produces an immutable registry fragment.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • collect discovered middlewares
 * • collect contribution middlewares
 * • remove duplicate registrations
 * • produce an immutable RegistryFragment
 *
 * It does NOT:
 *
 * • configure Nest middleware consumers
 * • execute middleware
 * • attach routes
 * • mutate the runtime
 *
 * =============================================================================
 */

export class MiddlewareRegistry implements BootstrapRegistry {
  /**
   * Registry identity.
   */
  public readonly name = "middleware";

  /**
   * Registry execution priority.
   */
  public readonly order = 30;

  /**
   * ---------------------------------------------------------------------------
   * Build middleware registry fragment.
   * ---------------------------------------------------------------------------
   */
  public async register(context: BootstrapContext): Promise<RegistryFragment> {
    const discovered = context.discovery?.middlewares ?? [];

    const contributed = context.contributions?.middlewares() ?? [];

    return Object.freeze({
      middlewares: this.merge(discovered, contributed),
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Merge middleware collections while preserving registration order.
   * ---------------------------------------------------------------------------
   */
  private merge(
    ...collections: readonly (readonly MiddlewareType[])[]
  ): readonly MiddlewareType[] {
    const result: MiddlewareType[] = [];

    const seen = new Set<MiddlewareType>();

    for (const collection of collections) {
      for (const middleware of collection) {
        if (seen.has(middleware)) {
          continue;
        }

        seen.add(middleware);

        result.push(middleware);
      }
    }

    return Object.freeze(result);
  }
}

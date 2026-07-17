import type { ProviderType } from "../../types/provider.type";

import type { BootstrapContext } from "../../contracts/bootstrap-context";

import type { RegistryFragment } from "../contracts/registry-fragment";
import type { BootstrapRegistry } from "../contracts/bootstrap-registry";

/* =============================================================================
 * Provider Registry
 * =============================================================================
 *
 * Registry strategy responsible for assembling the Kernel provider graph.
 *
 * ProviderRegistry collects providers originating from both the Discovery
 * Engine and the Contribution Manager, removes duplicate registrations and
 * produces an immutable registry fragment.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • collect discovered providers
 * • collect contribution providers
 * • normalize provider registrations
 * • eliminate duplicate providers
 * • preserve deterministic ordering
 *
 * It does NOT:
 *
 * • instantiate providers
 * • resolve dependency injection
 * • bootstrap NestJS
 * • mutate runtime state
 *
 * =============================================================================
 */

export class ProviderRegistry implements BootstrapRegistry {
  /**
   * Registry identity.
   */
  public readonly name = "provider";

  /**
   * Registry execution priority.
   */
  public readonly order = 20;

  /**
   * ---------------------------------------------------------------------------
   * Build provider registry fragment.
   * ---------------------------------------------------------------------------
   */
  public async register(context: BootstrapContext): Promise<RegistryFragment> {
    const discovered = context.discovery?.providers ?? [];

    const contributed = context.contributions?.providers() ?? [];

    return Object.freeze({
      providers: this.merge(discovered, contributed),
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Merge provider collections.
   *
   * Duplicate providers are removed using their registration identity while
   * preserving declaration order.
   * ---------------------------------------------------------------------------
   */
  private merge(
    ...collections: readonly (readonly ProviderType[])[]
  ): readonly ProviderType[] {
    const result: ProviderType[] = [];

    const identities = new Set<unknown>();

    for (const collection of collections) {
      for (const provider of collection) {
        const identity = this.identity(provider);

        if (identities.has(identity)) {
          continue;
        }

        identities.add(identity);

        result.push(provider);
      }
    }

    return Object.freeze(result);
  }

  /**
   * ---------------------------------------------------------------------------
   * Resolve the unique identity of a provider registration.
   *
   * Supports:
   *
   * • class providers
   * • value providers
   * • factory providers
   * • existing providers
   *
   * ---------------------------------------------------------------------------
   */
  private identity(provider: ProviderType): unknown {
    if (typeof provider === "function") {
      return provider;
    }

    if (
      typeof provider === "object" &&
      provider !== null &&
      "provide" in provider
    ) {
      return provider.provide;
    }

    return provider;
  }
}

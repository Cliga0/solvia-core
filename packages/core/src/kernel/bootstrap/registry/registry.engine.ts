import type { BootstrapContext } from "../contracts/bootstrap-context";
import type { RegistrySnapshot } from "./contracts/registry-snapshot";

import type { RegistryFragment } from "./contracts/registry-fragment";
import type { BootstrapRegistry } from "./contracts/bootstrap-registry";

import { ModuleRegistry } from "./strategies/module.registry";
import { ProviderRegistry } from "./strategies/provider.registry";
import { MiddlewareRegistry } from "./strategies/middleware.registry";

/* =============================================================================
 * Registry Engine
 * =============================================================================
 *
 * Coordinates the Registry phase of the Solvia Kernel bootstrap lifecycle.
 *
 * The Registry Engine orchestrates independent registry strategies responsible
 * for assembling the immutable Bootstrap Registry consumed by the Runtime
 * Builder.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Resolve registry strategies
 * • Execute strategies in deterministic order
 * • Aggregate registry fragments
 * • Produce the immutable RegistrySnapshot
 *
 * The engine never knows how individual artifacts are collected.
 * Each registry owns its own aggregation logic.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 * BootstrapContext
 *        │
 *        ▼
 * RegistryEngine
 *        │
 *        ├── ModuleRegistry
 *        ├── ProviderRegistry
 *        ├── MiddlewareRegistry
 *        ├── GuardRegistry          (future)
 *        ├── InterceptorRegistry    (future)
 *        ├── FilterRegistry         (future)
 *        └── ControllerRegistry     (future)
 *        │
 *        ▼
 * RegistrySnapshot
 *
 * =============================================================================
 */

export abstract class RegistryEngine {
  /**
   * ---------------------------------------------------------------------------
   * Execute the complete registry pipeline.
   * ---------------------------------------------------------------------------
   */
  public static async build(
    context: BootstrapContext,
  ): Promise<RegistrySnapshot> {
    const registries = this.resolve().sort(
      (left, right) => left.order - right.order,
    );

    const fragments: RegistryFragment[] = [];

    for (const registry of registries) {
      fragments.push(await registry.register(context));
    }

    return this.snapshot(fragments);
  }

  /* ===========================================================================
   * Registry Resolution
   * ========================================================================= */

  private static resolve(): BootstrapRegistry[] {
    return [
      new ModuleRegistry(),
      new ProviderRegistry(),
      new MiddlewareRegistry(),

      // Future
      // new ControllerRegistry(),
      // new GuardRegistry(),
      // new InterceptorRegistry(),
      // new FilterRegistry(),
    ];
  }

  /* ===========================================================================
   * Snapshot Assembly
   * ========================================================================= */

  private static snapshot(
    fragments: readonly RegistryFragment[],
  ): RegistrySnapshot {
    return Object.freeze({
      imports: this.merge(fragments, "imports"),

      providers: this.merge(fragments, "providers"),

      exports: this.merge(fragments, "exports"),

      middlewares: this.merge(fragments, "middlewares"),

      guards: this.merge(fragments, "guards"),

      interceptors: this.merge(fragments, "interceptors"),

      filters: this.merge(fragments, "filters"),
    });
  }

  /* ===========================================================================
   * Collection Merge
   * ========================================================================= */

  private static merge<K extends keyof RegistrySnapshot>(
    fragments: readonly RegistryFragment[],
    key: K,
  ): RegistrySnapshot[K] {
    const values = fragments.flatMap((fragment) => {
      const collection = fragment[key];

      return Array.isArray(collection) ? collection : [];
    });

    return Object.freeze([...new Set(values)]) as RegistrySnapshot[K];
  }
}

/* =============================================================================
 * Nest Runtime Adapter
 * =============================================================================
 *
 * Infrastructure adapter translating Solvia Kernel runtime artifacts into
 * NestJS composition metadata.
 *
 *
 * Architecture
 * ---------------------------------------------------------------------------
 *
 *              BootstrapRuntime
 *                     |
 *                     v
 *             NestRuntimeAdapter
 *                     |
 *                     v
 *          NestRuntimeMetadata
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Translate RegistrySnapshot into Nest metadata
 * • Preserve Kernel / Framework isolation
 * • Produce immutable adapter output
 *
 *
 * Does NOT:
 *
 * • Execute bootstrap
 * • Resolve dependencies
 * • Discover components
 * • Manage lifecycle
 *
 * =============================================================================
 */

import type { BootstrapRuntime } from "../../runtime/contracts/bootstrap-runtime";

import type { NestRuntimeMetadata } from "./contracts/nest-runtime-metadata";

import type { ModuleType } from "../../types/module.type";
import type { ProviderType } from "../../types/provider.type";
import type { ControllerType } from "../../types/controller.type";
import type { ExportType } from "../../types/export.type";

export class NestRuntimeAdapter {
  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor(private readonly runtime: BootstrapRuntime) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(runtime: BootstrapRuntime): NestRuntimeAdapter {
    return new NestRuntimeAdapter(runtime);
  }

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Convert Kernel runtime into Nest metadata.
   */
  public adapt(): NestRuntimeMetadata {
    this.validate();

    return Object.freeze({
      adapter: "nestjs",

      imports: Object.freeze([...this.resolveImports()]),

      providers: Object.freeze([...this.resolveProviders()]),

      controllers: Object.freeze([...this.resolveControllers()]),

      exports: Object.freeze([...this.resolveExports()]),

      metadata: Object.freeze({
        runtimeId: this.runtime.id,

        version: this.runtime.version,
      }),
    });
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(): void {
    if (!this.runtime) {
      throw new Error("NestRuntimeAdapter: runtime is required.");
    }

    if (!this.runtime.registry) {
      throw new Error("NestRuntimeAdapter: registry snapshot missing.");
    }
  }

  /* ===========================================================================
   * Imports
   * ========================================================================= */

  private resolveImports(): readonly ModuleType[] {
    return this.runtime.registry.imports;
  }

  /* ===========================================================================
   * Providers
   * ========================================================================= */

  private resolveProviders(): readonly ProviderType[] {
    return this.runtime.registry.providers;
  }

  /* ===========================================================================
   * Controllers
   * ========================================================================= */

  private resolveControllers(): readonly ControllerType[] {
    /**
     * Controllers are not yet part of RegistrySnapshot.
     *
     * Future source:
     *
     * - transport registry
     * - controller registry
     * - plugin registry
     */

    return [];
  }

  /* ===========================================================================
   * Exports
   * ========================================================================= */

  private resolveExports(): readonly ExportType[] {
    return this.runtime.registry.exports;
  }
}

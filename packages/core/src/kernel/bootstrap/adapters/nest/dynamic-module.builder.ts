import type { DynamicModule, Type } from "@nestjs/common";

import type { NestRuntimeMetadata } from "./contracts/nest-runtime-metadata";
import type { NestModuleOptions } from "./contracts/nest-module-options";

/* =============================================================================
 * Dynamic Module Builder
 * =============================================================================
 *
 * Materializes a NestJS DynamicModule from framework-independent runtime
 * metadata.
 *
 * This builder is the final adaptation boundary between the Solvia Kernel and
 * the NestJS module system.
 *
 *
 * Architecture
 * ---------------------------------------------------------------------------
 *
 *        BootstrapRuntime
 *               │
 *               ▼
 *      NestRuntimeAdapter
 *               │
 *               ▼
 *     NestRuntimeMetadata
 *               │
 *               │
 *     NestModuleOptions
 *               │
 *               ▼
 *     DynamicModuleBuilder
 *               │
 *               ▼
 *         DynamicModule
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Materialize a Nest DynamicModule
 * • Translate adapter metadata into Nest-compatible collections
 * • Apply module options
 * • Preserve Kernel/framework isolation
 *
 *
 * Does NOT
 * ---------------------------------------------------------------------------
 *
 * • Execute bootstrap
 * • Discover components
 * • Resolve dependencies
 * • Instantiate providers
 * • Manage lifecycle
 *
 * =============================================================================
 */

export class DynamicModuleBuilder {
  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor(
    private readonly metadata: NestRuntimeMetadata,
    private readonly options: NestModuleOptions,
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    metadata: NestRuntimeMetadata,
    options: NestModuleOptions = {},
  ): DynamicModuleBuilder {
    return new DynamicModuleBuilder(
      metadata,
      Object.freeze({
        ...options,
      }),
    );
  }

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Materialize a NestJS DynamicModule.
   */
  public build(module: Type): DynamicModule {
    this.validate(module);

    return {
      module,

      global: this.options.global ?? false,

      imports: this.buildImports(),

      providers: this.buildProviders(),

      controllers: this.buildControllers(),

      exports: this.buildExports(),
    };
  }

  /* ===========================================================================
   * Imports
   * ========================================================================= */

  private buildImports(): DynamicModule["imports"] {
    return [];
  }

  /* ===========================================================================
   * Providers
   * ========================================================================= */

  private buildProviders(): DynamicModule["providers"] {
    return [];
  }

  /* ===========================================================================
   * Controllers
   * ========================================================================= */

  private buildControllers(): DynamicModule["controllers"] {
    return [];
  }

  /* ===========================================================================
   * Exports
   * ========================================================================= */

  private buildExports(): DynamicModule["exports"] {
    return [];
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(module: Type): void {
    if (!module) {
      throw new Error("DynamicModuleBuilder: module reference is required.");
    }

    if (!this.metadata) {
      throw new Error("DynamicModuleBuilder: runtime metadata is required.");
    }
  }
}

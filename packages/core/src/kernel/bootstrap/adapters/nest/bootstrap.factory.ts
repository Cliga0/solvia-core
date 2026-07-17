import { DynamicModule, Type } from "@nestjs/common";

import type { BootstrapRuntime } from "../../runtime/contracts/bootstrap-runtime";

import { NestRuntimeAdapter } from "../../adapters/nest/nest-runtime.adapter";

import { DynamicModuleBuilder } from "../../adapters/nest/dynamic-module.builder";

/* =============================================================================
 * Bootstrap Factory
 * =============================================================================
 *
 * NestJS adapter entry point.
 *
 * Converts a Kernel BootstrapRuntime into a NestJS DynamicModule.
 *
 *
 * Architecture:
 *
 *
 * BootstrapRuntime
 *
 *        |
 *        v
 *
 * BootstrapFactory
 *
 *        |
 *        v
 *
 * NestRuntimeAdapter
 *
 *        |
 *        v
 *
 * DynamicModuleBuilder
 *
 *        |
 *        v
 *
 * NestJS DynamicModule
 *
 *
 *
 * Responsibilities:
 *
 * • Own Nest adaptation orchestration
 * • Validate runtime availability
 * • Delegate runtime adaptation
 * • Produce final DynamicModule
 *
 *
 * Does NOT:
 *
 * • Execute bootstrap
 * • Discover contributions
 * • Manage lifecycle
 * • Create providers
 *
 * =============================================================================
 */

export class BootstrapFactory {
  private constructor(private readonly runtime: BootstrapRuntime) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(runtime: BootstrapRuntime): BootstrapFactory {
    return new BootstrapFactory(runtime);
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(module: Type): DynamicModule {
    this.validate();

    const metadata = NestRuntimeAdapter.create(this.runtime).adapt();

    return DynamicModuleBuilder.create(metadata).build(module);
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(): void {
    if (!this.runtime) {
      throw new Error("BootstrapFactory: BootstrapRuntime is required.");
    }
  }
}

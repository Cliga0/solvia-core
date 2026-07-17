import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";

import type { BootstrapOptions } from "../../contracts/bootstrap-options";
import type { BootstrapRuntime } from "../../runtime/contracts/bootstrap-runtime";

import { BootstrapLoader } from "../../bootstrap.loader";
import { BootstrapFactory } from "./bootstrap.factory";

/* =============================================================================
 * Bootstrap Nest Module
 * =============================================================================
 *
 * NestJS integration adapter for Solvia Kernel bootstrap runtime.
 *
 * This module represents the framework boundary between:
 *
 *      Solvia Kernel
 *            |
 *            v
 *      BootstrapRuntime
 *            |
 *            v
 *      NestJS DynamicModule
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • expose Solvia bootstrap through NestJS
 * • initialize Kernel runtime through BootstrapLoader
 * • delegate Nest module creation to BootstrapFactory
 * • expose runtime artifacts through Nest dependency injection
 *
 *
 * Does NOT:
 *
 * • execute bootstrap phases
 * • resolve contributions
 * • perform discovery
 * • build registry
 * • manage lifecycle
 *
 *
 * Those responsibilities belong to:
 *
 * • BootstrapEngine
 * • Contribution subsystem
 * • Registry subsystem
 * • Runtime lifecycle managers
 *
 * =============================================================================
 */

@Module({})
export class BootstrapNestModule {
  /* ===========================================================================
   * Root Bootstrap
   * ========================================================================= */

  /**
   * Creates a configured Solvia Nest runtime.
   *
   * Bootstrap execution happens before the DynamicModule
   * is materialized.
   */
  public static async forRoot(
    options: BootstrapOptions = {},
  ): Promise<DynamicModule> {
    const runtime = await BootstrapLoader.load(options);

    return this.createDynamicModule(runtime);
  }

  /**
   * Creates a configured Solvia Nest runtime asynchronously.
   *
   * Supports deferred configuration resolution.
   *
   * Examples:
   *
   * - environment loading
   * - remote configuration
   * - secrets providers
   */
  public static async forRootAsync(
    options: BootstrapOptions | Promise<BootstrapOptions> = {},
  ): Promise<DynamicModule> {
    const runtime = await BootstrapLoader.loadAsync(options);

    return this.createDynamicModule(runtime);
  }

  /* ===========================================================================
   * Dynamic Module Materialization
   * ========================================================================= */

  /**
   * Converts Kernel runtime into Nest DynamicModule metadata.
   *
   * Delegates the translation responsibility to BootstrapFactory.
   */
  private static createDynamicModule(runtime: BootstrapRuntime): DynamicModule {
    return BootstrapFactory.create(runtime).build(BootstrapNestModule);
  }
}

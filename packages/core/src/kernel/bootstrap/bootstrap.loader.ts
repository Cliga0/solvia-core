import type { BootstrapOptions } from "./contracts/bootstrap-options";

import type { BootstrapRuntime } from "./runtime/contracts/bootstrap-runtime";

import { BootstrapEngine } from "./bootstrap.engine";

import { BootstrapOptionsValidator } from "./validators/bootstrap-options.validator";

/* =============================================================================
 * Bootstrap Loader
 * =============================================================================
 *
 * Public bootstrap entry point.
 *
 * The Loader is the external boundary of the Kernel bootstrap subsystem.
 *
 * It provides a stable API while hiding the internal bootstrap architecture.
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • normalize bootstrap options
 * • create BootstrapEngine
 * • start Kernel bootstrap
 * • return immutable runtime
 *
 *
 * Does NOT:
 *
 * • build bootstrap plans
 * • execute phases
 * • validate execution
 * • manage lifecycle transitions
 *
 * =============================================================================
 */

export abstract class BootstrapLoader {
  /**
   * ---------------------------------------------------------------------------
   * Load Kernel runtime.
   * ---------------------------------------------------------------------------
   */
  public static async load(
    options: BootstrapOptions = {},
  ): Promise<BootstrapRuntime> {
    BootstrapOptionsValidator.validate(options);

    const runtime = await BootstrapEngine.create(
      this.normalize(options),
    ).boot();

    return this.freeze(runtime);
  }

  /**
   * ---------------------------------------------------------------------------
   * Load Kernel runtime from async options.
   * ---------------------------------------------------------------------------
   *
   * Useful for:
   *
   * • configuration loading
   * • environment resolution
   * • remote configuration
   *
   */
  public static async loadAsync(
    options: BootstrapOptions | Promise<BootstrapOptions>,
  ): Promise<BootstrapRuntime> {
    const resolved = await options;

    return this.load(resolved);
  }

  /**
   * ---------------------------------------------------------------------------
   * Normalize external options.
   * ---------------------------------------------------------------------------
   */
  private static normalize(options: BootstrapOptions): BootstrapOptions {
    return Object.freeze({
      profile: options.profile,

      features: Object.freeze(options.features ?? []),

      imports: Object.freeze(options.imports ?? []),

      providers: Object.freeze(options.providers ?? []),

      metadata: Object.freeze(options.metadata ?? {}),
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Freeze runtime boundary.
   * ---------------------------------------------------------------------------
   */
  private static freeze(runtime: BootstrapRuntime): BootstrapRuntime {
    return Object.freeze(runtime);
  }
}

import type { BootstrapContext } from "../contracts/bootstrap-context";
import type { BootstrapDiscovery } from "./contracts/bootstrap-discovery";
import type { DiscoveryResult } from "./contracts/discovery-result";

/* =============================================================================
 * Discovery Engine
 * =============================================================================
 *
 * Coordinates the discovery phase of the Solvia Kernel bootstrap lifecycle.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Resolve discovery strategies
 * • Execute discovery providers
 * • Aggregate discovery outputs
 * • Produce immutable discovery snapshot
 *
 * DiscoveryEngine does NOT:
 *
 * • scan filesystem directly
 * • inspect modules itself
 * • register providers
 * • mutate runtime
 *
 * Discovery responsibilities are delegated to BootstrapDiscovery strategies.
 *
 * =============================================================================
 */

export class DiscoveryEngine {
  /**
   * ---------------------------------------------------------------------------
   * Execute discovery pipeline.
   * ---------------------------------------------------------------------------
   */
  public static async run(context: BootstrapContext): Promise<DiscoveryResult> {
    const strategies = this.resolve(context);

    if (strategies.length === 0) {
      return this.empty();
    }

    const results = await this.execute(context, strategies);

    return this.aggregate(results);
  }

  /**
   * ---------------------------------------------------------------------------
   * Resolve discovery strategies.
   *
   * Future extension point:
   *
   * - filesystem discovery
   * - module metadata discovery
   * - plugin discovery
   * - workspace discovery
   *
   * ---------------------------------------------------------------------------
   */
  private static resolve(
    _context: BootstrapContext,
  ): readonly BootstrapDiscovery[] {
    return [
      /**
       * Example future:
       *
       * new ModuleDiscovery(),
       * new ProviderDiscovery(),
       * new PluginDiscovery(),
       */
    ];
  }

  /**
   * ---------------------------------------------------------------------------
   * Execute discovery strategies.
   * ---------------------------------------------------------------------------
   */
  private static async execute(
    context: BootstrapContext,
    strategies: readonly BootstrapDiscovery[],
  ): Promise<readonly DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];

    for (const strategy of strategies) {
      const result = await strategy.discover(context);

      results.push(result);
    }

    return results;
  }

  /**
   * ---------------------------------------------------------------------------
   * Aggregate discovery results.
   * ---------------------------------------------------------------------------
   */
  private static aggregate(
    results: readonly DiscoveryResult[],
  ): DiscoveryResult {
    return Object.freeze({
      imports: this.mergeCollection(results, (result) => result.imports),

      modules: this.mergeCollection(results, (result) => result.modules),

      providers: this.mergeCollection(results, (result) => result.providers),

      controllers: this.mergeCollection(
        results,
        (result) => result.controllers,
      ),

      middlewares: this.mergeCollection(
        results,
        (result) => result.middlewares,
      ),

      guards: this.mergeCollection(results, (result) => result.guards),

      interceptors: this.mergeCollection(
        results,
        (result) => result.interceptors,
      ),

      filters: this.mergeCollection(results, (result) => result.filters),

      exports: this.mergeCollection(results, (result) => result.exports),
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Empty discovery snapshot.
   * ---------------------------------------------------------------------------
   */
  private static empty(): DiscoveryResult {
    return Object.freeze({
      imports: [],

      modules: [],

      providers: [],

      controllers: [],

      middlewares: [],

      guards: [],

      interceptors: [],

      filters: [],

      exports: [],
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Merge collection avoiding duplicates.
   * ---------------------------------------------------------------------------
   */
  private static mergeCollection<T>(
    results: readonly DiscoveryResult[],
    selector: (result: DiscoveryResult) => readonly T[],
  ): readonly T[] {
    return Object.freeze([...new Set(results.flatMap(selector))]);
  }
}

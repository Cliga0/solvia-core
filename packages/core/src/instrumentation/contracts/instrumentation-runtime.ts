import type { InstrumentationContext } from "./instrumentation-context";
import { InstrumentationOptions } from "./instrumentation-options";
import type { InstrumentationProvider } from "./instrumentation-provider";

/* =============================================================================
 * Instrumentation Runtime
 * =============================================================================
 *
 * Immutable runtime produced by the Instrumentation Engine.
 *
 * The runtime represents the operational instrumentation state of the Kernel.
 *
 * Once created it never changes.
 *
 * =============================================================================
 */

export interface InstrumentationRuntime {
  /**
   * Runtime identifier.
   */
  readonly id: string;

  /**
   * Runtime creation timestamp.
   */
  readonly startedAt: Date;

  /**
   * Active providers.
   */
  readonly providers: readonly InstrumentationProvider[];

  /**
   * Runtime environment.
   */
  readonly environment: string;

  /**
   * Diagnostic mode.
   */
  readonly debug: boolean;

  /**
   * Global instrumentation attributes.
   */
  readonly attributes: Readonly<Record<string, unknown>>;

  readonly completedAt: Date;

  readonly duration: number;


  readonly options: Readonly<InstrumentationOptions>;


  readonly metadata:
    ReadonlyMap<string, unknown>;


  readonly errors:
    ReadonlyMap<InstrumentationProvider, Error>;


  readonly healthy: boolean;


  readonly summary: {
    readonly providerCount: number;
    readonly enabledProviders: number;
    readonly failedProviders: number;
  };


  readonly diagnostics: {
    readonly healthy: boolean;
    readonly warnings: readonly string[];
    readonly failures: readonly InstrumentationProvider[];
  };


  readonly capabilities:
    readonly string[];


  readonly timeline:
    readonly unknown[];
}
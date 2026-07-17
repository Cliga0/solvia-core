import type { InstrumentationOptions } from "./instrumentation-options";
import type { InstrumentationProvider } from "./instrumentation-provider";

/* =============================================================================
 * Instrumentation Context
 * =============================================================================
 *
 * Execution contract shared with instrumentation providers.
 *
 * The context exposes the controlled runtime surface available during
 * instrumentation bootstrap.
 *
 * Providers may:
 *
 * • Read immutable runtime information
 * • Register successful initialization
 * • Publish metadata
 *
 * Providers cannot:
 *
 * • mutate runtime internals
 * • access provider registry
 * • control lifecycle state
 *
 * =============================================================================
 */

export interface InstrumentationContext {
  /**
   * Unique instrumentation session identifier.
   */
  readonly id: string;

  /**
   * Instrumentation startup configuration.
   */
  readonly options: Readonly<InstrumentationOptions>;

  /**
   * Runtime environment.
   *
   * Examples:
   *
   * development
   * production
   * test
   */
  readonly environment: string;

  /**
   * Enables diagnostic instrumentation.
   */
  readonly debug: boolean;

  /**
   * Global runtime attributes.
   */
  readonly attributes: Readonly<Record<string, unknown>>;

  registerProvider(provider: InstrumentationProvider): void;

  /**
   * Indicates that a provider initialized successfully.
   */
  markInitialized(provider: InstrumentationProvider): void;

  /**
   * Records provider initialization failure.
   */
  markFailed(provider: InstrumentationProvider, error: Error): void;

  /**
   * Stores runtime metadata.
   *
   * Metadata is consumed by the runtime builder.
   */
  setMetadata(key: string, value: unknown): void;
}

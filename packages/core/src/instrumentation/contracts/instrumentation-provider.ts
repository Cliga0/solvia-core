import type { InstrumentationContext } from "./instrumentation-context";
import type { InstrumentationOptions } from "./instrumentation-options";

/* =============================================================================
 * Instrumentation Provider
 * =============================================================================
 *
 * Contract implemented by every instrumentation provider.
 *
 * Providers encapsulate third-party integrations (OpenTelemetry, Sentry,
 * Prometheus, Console, etc.) behind a common Kernel abstraction.
 *
 * The Kernel never depends on concrete implementations.
 *
 * =============================================================================
 */

export interface InstrumentationProvider {
  /**
   * Unique provider identifier.
   */
  readonly name: string;

  /**
   * Indicates whether the provider supports the current runtime.
   */
  supports(context: InstrumentationContext): boolean;

  /**
   * Initializes the provider.
   */
  initialize(
    context: InstrumentationContext,
    options: InstrumentationOptions,
  ): Promise<void>;

  /**
   * Releases provider resources.
   */
  shutdown(context: InstrumentationContext): Promise<void>;
}

/* =============================================================================
 * Instrumentation Options
 * =============================================================================
 *
 * Defines instrumentation policy.
 *
 * Contains configuration only.
 *
 * Does NOT contain provider instances.
 *
 * =============================================================================
 */

export interface InstrumentationOptions {
  /**
   * Global instrumentation switch.
   */
  readonly enabled?: boolean;

  /**
   * Runtime environment.
   */
  readonly environment?: string;

  /**
   * Application version.
   */
  readonly version?: string;

  /**
   * Diagnostic mode.
   */
  readonly debug?: boolean;

  /**
   * Global telemetry attributes.
   */
  readonly attributes?: Readonly<Record<string, unknown>>;

  /**
   * Console instrumentation.
   */
  readonly console?: {
    readonly enabled?: boolean;
  };

  /**
   * OpenTelemetry configuration.
   */
  readonly opentelemetry?: {
    readonly enabled?: boolean;

    readonly interval?: number;

    readonly console?: boolean;

    readonly otlp?: {
      readonly enabled?: boolean;

      readonly endpoint?: string;
    };
  };

  /**
   * Prometheus exporter.
   */
  readonly prometheus?: {
    readonly enabled?: boolean;

    readonly port?: number;
  };

  /**
   * Sentry configuration.
   */
  readonly sentry?: {
    readonly enabled?: boolean;

    readonly dsn?: string;

    readonly tracesSampleRate?: number;

    readonly profilesSampleRate?: number;

    readonly sendDefaultPii?: boolean;
  };
}

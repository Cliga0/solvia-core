import { InstrumentationOptions } from "./contracts/instrumentation-options";
import { InstrumentationRuntime } from "./contracts/instrumentation-runtime";

import { InstrumentationRuntimeContext } from "./runtime/instrumentation-runtime.context";
import { InstrumentationRuntimeBuilder } from "./runtime/instrumentation-runtime.builder";

import { InstrumentationProvider } from "./contracts/instrumentation-provider";
import { InstrumentationState } from "./enums/instrumentation-state.enum";

import { ConsoleProvider } from "./providers/console.provider";
import { SentryProvider } from "./providers/sentry.provider";
import { PrometheusProvider } from "./providers/prometheus.provider";
import { OpenTelemetryProvider } from "./providers/opentelemetry.provider";

/* =============================================================================
 * Instrumentation Engine
 * =============================================================================
 *
 * Orchestrates the complete instrumentation lifecycle.
 *
 * Responsibilities:
 *
 * - Create instrumentation context
 * - Resolve providers
 * - Initialize providers
 * - Handle failures
 * - Build runtime
 * - Shutdown instrumentation
 *
 * Does NOT:
 *
 * - configure providers internally
 * - create metrics
 * - manage application lifecycle
 *
 * =============================================================================
 */

export class InstrumentationEngine {
  private readonly context: InstrumentationRuntimeContext;

  private readonly providers: InstrumentationProvider[];

  private state: InstrumentationState = InstrumentationState.CREATED;

  private constructor(
    private readonly options: InstrumentationOptions = {},
    providers?: readonly InstrumentationProvider[],
  ) {
    this.context = InstrumentationRuntimeContext.create(options);

    this.providers = providers ? [...providers] : this.resolveProviders();
  }

  private assertState(expected: InstrumentationState): void {
    if (this.state !== expected) {
      throw new Error(
        `InstrumentationEngine cannot execute in state ${this.state}. Expected ${expected}.`,
      );
    }
  }

  public static create(
    options: InstrumentationOptions = {},
    providers?: readonly InstrumentationProvider[],
  ): InstrumentationEngine {
    return new InstrumentationEngine(options, providers);
  }

  public async initialize(): Promise<InstrumentationRuntime> {
    this.assertState(InstrumentationState.CREATED);

    this.state = InstrumentationState.INITIALIZING;

    try {
      await this.initializeProviders();

      this.context.markReady();

      this.state = InstrumentationState.READY;

      return this.buildRuntime();
    } catch (error) {
      this.context.markBootstrapFailed(
        error instanceof Error ? error : new Error(String(error)),
      );

      this.state = InstrumentationState.FAILED;

      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.state === InstrumentationState.SHUTDOWN) {
      return;
    }

    for (const provider of [...this.providers].reverse()) {
      await provider.shutdown(this.context);
    }

    this.state = InstrumentationState.SHUTDOWN;
  }

  private async initializeProviders() {
    for (const provider of this.providers) {
      await provider.initialize(this.context, this.options);
    }
  }

  private buildRuntime() {
    return InstrumentationRuntimeBuilder.create(this.context).build();
  }

  private resolveProviders(): InstrumentationProvider[] {
    const providers = [
      new ConsoleProvider(),
      new OpenTelemetryProvider(),
      new PrometheusProvider(),
      new SentryProvider(),
    ];

    return providers.filter((provider) => provider.supports(this.options));
  }
}

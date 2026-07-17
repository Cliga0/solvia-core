import { metrics } from "@opentelemetry/api";

import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";

import type { InstrumentationProvider } from "../contracts/instrumentation-provider";
import type { InstrumentationContext } from "../contracts/instrumentation-context";
import type { InstrumentationOptions } from "../contracts/instrumentation-options";

/* =============================================================================
 * OpenTelemetry Provider
 * =============================================================================
 *
 * Owns OpenTelemetry SDK lifecycle.
 *
 * =============================================================================
 */

export class OpenTelemetryProvider implements InstrumentationProvider {
  public readonly name = "opentelemetry";

  private meterProvider?: MeterProvider;

  private initialized = false;

  public supports(options: InstrumentationOptions): boolean {
    return options.opentelemetry?.enabled === true;
  }

  public async initialize(
    context: InstrumentationContext,
    options: InstrumentationOptions,
  ): Promise<void> {
    if (!this.supports(options)) {
      context.setMetadata("opentelemetry.status", "disabled");

      return;
    }

    if (this.initialized) {
      context.setMetadata("opentelemetry.status", "already_initialized");

      return;
    }

    try {
      const readers = this.createReaders(options);

      if (readers.length === 0) {
        throw new Error("OpenTelemetryProvider: no metric readers configured.");
      }

      this.meterProvider = new MeterProvider({
        readers,
      });

      metrics.setGlobalMeterProvider(this.meterProvider);

      this.initialized = true;

      context.markInitialized(this);

      context.setMetadata("opentelemetry.status", "running");

      context.setMetadata("opentelemetry.readers", readers.length);
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      context.markFailed(this, exception);

      throw exception;
    }
  }

  public async shutdown(context: InstrumentationContext): Promise<void> {
    if (!this.meterProvider) {
      return;
    }

    try {
      await this.meterProvider.shutdown();

      this.meterProvider = undefined;

      this.initialized = false;

      context.setMetadata("opentelemetry.status", "stopped");
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      context.markFailed(this, exception);

      throw exception;
    }
  }

  protected createReaders(
    options: InstrumentationOptions,
  ): PeriodicExportingMetricReader[] {
    const readers: PeriodicExportingMetricReader[] = [];

    const otel = options.opentelemetry;

    if (otel?.otlp?.enabled) {
      if (!otel.otlp.endpoint) {
        throw new Error("OpenTelemetryProvider: OTLP endpoint missing.");
      }

      readers.push(
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: otel.otlp.endpoint,
          }),

          exportIntervalMillis: otel.interval ?? 10000,
        }),
      );
    }

    if (otel?.console) {
      readers.push(
        new PeriodicExportingMetricReader({
          exporter: new ConsoleMetricExporter(),

          exportIntervalMillis: otel.interval ?? 10000,
        }),
      );
    }

    return readers;
  }
}

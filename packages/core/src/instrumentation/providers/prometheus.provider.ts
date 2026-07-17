import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

import type { InstrumentationProvider } from "../contracts/instrumentation-provider";
import type { InstrumentationContext } from "../contracts/instrumentation-context";
import type { InstrumentationOptions } from "../contracts/instrumentation-options";

/* =============================================================================
 * Prometheus Provider
 * =============================================================================
 *
 * Owns Prometheus metrics exposition.
 *
 * Responsibilities:
 *
 * • Create Prometheus exporter
 * • Validate exporter configuration
 * • Register lifecycle state
 * • Shutdown exporter cleanly
 *
 * Does NOT:
 *
 * • Create application metrics
 * • Own OpenTelemetry SDK
 * • Manage HTTP server lifecycle
 *
 * =============================================================================
 */

export class PrometheusProvider implements InstrumentationProvider {
  public readonly name = "prometheus";

  private exporter?: PrometheusExporter;

  private initialized = false;

  public supports(options: InstrumentationOptions): boolean {
    return options.prometheus?.enabled === true;
  }

  public async initialize(
    context: InstrumentationContext,
    options: InstrumentationOptions,
  ): Promise<void> {
    if (!this.supports(options)) {
      context.setMetadata("prometheus.status", "disabled");

      return;
    }

    if (this.initialized) {
      return;
    }

    try {
      const port = options.prometheus?.port ?? 9464;

      this.validatePort(port);

      this.exporter = new PrometheusExporter({
        port,
      });

      this.initialized = true;

      context.markInitialized(this);

      context.setMetadata("prometheus.status", "running");

      context.setMetadata("prometheus.port", port);
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      context.markFailed(this, exception);

      throw exception;
    }
  }

  public async shutdown(context: InstrumentationContext): Promise<void> {
    if (!this.exporter || !this.initialized) {
      return;
    }

    try {
      await this.exporter.shutdown();

      this.initialized = false;

      context.setMetadata("prometheus.status", "stopped");
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      context.markFailed(this, exception);

      throw exception;
    }
  }

  private validatePort(port: number): void {
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid Prometheus port: ${port}`);
    }
  }
}

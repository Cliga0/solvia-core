import type { InstrumentationContext } from "../contracts/instrumentation-context";
import type { InstrumentationOptions } from "../contracts/instrumentation-options";
import type { InstrumentationProvider } from "../contracts/instrumentation-provider";

/* =============================================================================
 * Console Provider
 * =============================================================================
 *
 * Provides native console instrumentation metadata.
 *
 * Responsibilities:
 *
 * • Validate activation
 * • Register console capability
 * • Expose runtime metadata
 * • Participate in lifecycle
 *
 * Does NOT:
 *
 * • Replace application logger
 * • Intercept console methods
 * • Manage logging infrastructure
 *
 * =============================================================================
 */

export class ConsoleProvider implements InstrumentationProvider {
  public readonly name = "console";

  public readonly version = "1.0.0";

  private initialized = false;

  public supports(options: InstrumentationOptions): boolean {
    return options.console?.enabled === true;
  }

  public async initialize(
    context: InstrumentationContext,
    options: InstrumentationOptions,
  ): Promise<void> {
    if (!this.supports(options)) {
      context.setMetadata("console.status", "disabled");

      return;
    }

    try {
      this.validate(context);

      context.markInitialized(this);

      context.setMetadata("console.status", "running");

      context.setMetadata("console.name", this.name);

      context.setMetadata("console.version", this.version);

      context.setMetadata("console.runtime", "node");

      context.setMetadata("console.destination", ["stdout", "stderr"]);

      context.setMetadata("console.initializedAt", new Date());

      this.initialized = true;
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      context.markFailed(this, exception);

      throw exception;
    }
  }

  public async shutdown(context: InstrumentationContext): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.initialized = false;

    context.setMetadata("console.status", "stopped");
  }

  public async health(): Promise<boolean> {
    return this.initialized;
  }

  protected validate(context: InstrumentationContext): void {
    if (!context) {
      throw new Error("ConsoleProvider: InstrumentationContext missing.");
    }
  }
}

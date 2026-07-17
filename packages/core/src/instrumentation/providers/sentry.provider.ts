import * as Sentry from "@sentry/node";

import { nodeProfilingIntegration } from "@sentry/profiling-node";

import type { InstrumentationProvider } from "../contracts/instrumentation-provider";
import type { InstrumentationContext } from "../contracts/instrumentation-context";
import type { InstrumentationOptions } from "../contracts/instrumentation-options";

/* =============================================================================
 * Sentry Instrumentation Provider
 * =============================================================================
 *
 * Owns Sentry SDK lifecycle.
 *
 * Responsibilities:
 *
 * • Validate Sentry configuration
 * • Initialize SDK
 * • Register lifecycle state
 * • Shutdown SDK cleanly
 *
 * Does NOT:
 *
 * • capture application exceptions
 * • manage filters
 * • own logging
 *
 * =============================================================================
 */

export class SentryProvider implements InstrumentationProvider {
  public readonly name = "sentry";

  private initialized = false;

  public supports(options: InstrumentationOptions): boolean {
    return Boolean(options.sentry?.enabled && options.sentry.dsn);
  }

  public async initialize(
    context: InstrumentationContext,
    options: InstrumentationOptions,
  ): Promise<void> {
    if (!this.supports(options)) {
      context.setMetadata("sentry.status", "disabled");

      return;
    }

    if (this.initialized) {
      return;
    }

    const sentry = options.sentry!;

    Sentry.init({
      dsn: sentry.dsn,

      environment: options.environment,

      release: options.version,

      tracesSampleRate: sentry.tracesSampleRate ?? 0.1,

      profilesSampleRate: sentry.profilesSampleRate ?? 0.3,

      sendDefaultPii: sentry.sendDefaultPii ?? false,

      integrations: [
        Sentry.httpIntegration(),

        Sentry.expressIntegration(),

        Sentry.graphqlIntegration(),

        Sentry.postgresIntegration(),

        nodeProfilingIntegration(),
      ],
    });

    this.initialized = true;

    context.markInitialized(this);

    context.setMetadata("sentry.status", "running");

    context.setMetadata("sentry.environment", options.environment);
  }

  public async shutdown(context: InstrumentationContext): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await Sentry.close();

    this.initialized = false;

    context.setMetadata("sentry.status", "stopped");
  }
}

import { InstrumentationEngine } from "../../../instrumentation/instrumentation.engine";

import { ShutdownHook } from "../graceful-shutdown";

import { ShutdownPriority } from "./shutdown-priority";

/* =============================================================================
 * Instrumentation Shutdown Hook
 * =============================================================================
 *
 * Flushes and terminates the instrumentation runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Flush pending telemetry
 * • Flush metrics
 * • Flush traces
 * • Flush logs
 * • Shutdown instrumentation providers
 *
 * =============================================================================
 */

export class InstrumentationShutdownHook implements ShutdownHook {
  public readonly name = "instrumentation";

  public readonly priority = ShutdownPriority.INSTRUMENTATION;

  public constructor(private readonly engine: InstrumentationEngine) {}

  public async shutdown(): Promise<void> {
    await this.engine.shutdown();
  }
}

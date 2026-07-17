import { ApplicationServer } from "../application.server";

import { ShutdownHook } from "../graceful-shutdown";

import { ShutdownPriority } from "./shutdown-priority";

/* =============================================================================
 * Server Shutdown Hook
 * =============================================================================
 *
 * Stops the application server.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Stop accepting new connections
 * • Wait for active requests to complete
 * • Release server resources
 *
 * =============================================================================
 */

export class ServerShutdownHook implements ShutdownHook {
  public readonly name = "server";

  public readonly priority = ShutdownPriority.SERVER;

  public constructor(private readonly server: ApplicationServer) {}

  public async shutdown(): Promise<void> {
    await this.server.close();
  }
}

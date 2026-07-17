import { ApplicationBootstrap } from "./application/application.bootstrap";

import type { ApplicationOptions } from "./application/contracts/application.options";

/* =============================================================================
 * Solvia Runtime Entry Point
 * =============================================================================
 *
 * Starts the Solvia application runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Create the application bootstrap
 * • Execute the complete startup pipeline
 * • Handle unrecoverable bootstrap failures
 *
 * =============================================================================
 */

/**
 * Boots a Solvia application.
 */
export async function bootstrapSolvia(
  options: ApplicationOptions,
): Promise<void> {
  try {
    await ApplicationBootstrap.create(options).run();
  } catch (error) {
    console.error("[Solvia] Bootstrap failed.");

    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
}

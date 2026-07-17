import { INestApplication, NestApplicationOptions, Type } from "@nestjs/common";

import { NestFactory } from "@nestjs/core";

import type { ApplicationOptions } from "./contracts/application.options";

import type { RuntimeOptions } from "./contracts/runtime-options";

/* =============================================================================
 * Application Factory
 * =============================================================================
 *
 * Framework boundary responsible for materializing the Nest runtime.
 *
 * Architecture
 * ---------------------------------------------------------------------------
 *
 *        Solvia Runtime
 *              |
 *              v
 *      ApplicationFactory
 *              |
 *              v
 *          NestFactory
 *              |
 *              v
 *       INestApplication
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * ✓ Validate application creation input
 * ✓ Translate runtime options into Nest options
 * ✓ Create Nest application instance
 * ✓ Isolate NestJS dependency
 *
 *
 * Does NOT:
 *
 * ✗ Configure application
 * ✗ Start HTTP server
 * ✗ Manage lifecycle
 * ✗ Register providers
 * ✗ Execute bootstrap
 *
 * =============================================================================
 */

export class ApplicationFactory {
  private constructor() {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static async create(
    options: ApplicationOptions,
  ): Promise<INestApplication> {
    this.validate(options);

    const nestOptions = this.createNestOptions(options.runtime);

    try {
      return await NestFactory.create(options.module, nestOptions);
    } catch (error) {
      throw this.wrapCreationError(error);
    }
  }

  /* ===========================================================================
   * Nest Options
   * ========================================================================= */

  private static createNestOptions(
    runtime?: RuntimeOptions,
  ): Readonly<NestApplicationOptions> {
    return Object.freeze({
      bufferLogs: runtime?.bufferLogs ?? false,

      snapshot: runtime?.snapshot ?? false,

      rawBody: runtime?.rawBody ?? false,
    });
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private static validate(options: ApplicationOptions): void {
    if (!options) {
      throw new Error("ApplicationFactory: application options are required.");
    }

    if (!options.module) {
      throw new Error(
        "ApplicationFactory: root application module is required.",
      );
    }

    if (typeof options.module !== "function") {
      throw new Error(
        "ApplicationFactory: application module must be a constructor.",
      );
    }
  }

  /* ===========================================================================
   * Error Handling
   * ========================================================================= */

  private static wrapCreationError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(
        `ApplicationFactory: failed creating Nest application. ${error.message}`,
        {
          cause: error,
        },
      );
    }

    return new Error("ApplicationFactory: failed creating Nest application.");
  }
}

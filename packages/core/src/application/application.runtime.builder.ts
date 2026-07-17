import type { INestApplication } from "@nestjs/common";

import type { BootstrapRuntime } from "../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import type { InstrumentationRuntime } from "../instrumentation/contracts/instrumentation-runtime";

import type { ApplicationContext } from "./application.context";
import type { ApplicationRuntime } from "./contracts/application.runtime";

import type { ApplicationServer } from "./server/application.server";

/* =============================================================================
 * Application Runtime Builder
 * =============================================================================
 *
 * Materializes the immutable ApplicationRuntime.
 *
 * Responsibilities:
 *
 * - Validate runtime dependencies
 * - Assemble runtime state
 * - Build runtime capabilities
 * - Normalize metadata
 * - Freeze final artifact
 *
 *
 * This builder:
 *
 * - DOES NOT bootstrap
 * - DOES NOT start infrastructure
 * - DOES NOT manage lifecycle
 *
 *
 * It only transforms the completed application state into the public runtime
 * contract.
 *
 * =============================================================================
 */

export class ApplicationRuntimeBuilder {
  private context?: ApplicationContext;

  private instrumentation?: InstrumentationRuntime;

  private kernel?: BootstrapRuntime;

  private application?: INestApplication;

  private server?: ApplicationServer;

  private constructor() {}

  /**
   * Factory.
   */
  public static create(): ApplicationRuntimeBuilder {
    return new ApplicationRuntimeBuilder();
  }

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  public withContext(context: ApplicationContext): this {
    this.context = context;

    return this;
  }

  public withInstrumentation(instrumentation: InstrumentationRuntime): this {
    this.instrumentation = instrumentation;

    return this;
  }

  public withKernel(kernel: BootstrapRuntime): this {
    this.kernel = kernel;

    return this;
  }

  public withApplication(application: INestApplication): this {
    this.application = application;

    return this;
  }

  public withServer(server: ApplicationServer): this {
    this.server = server;

    return this;
  }

  /* ===========================================================================
   * Build
   * ========================================================================= */

  public build(): ApplicationRuntime {
    this.validate();

    const context = this.context!;

    const application = this.application!;

    const server = this.server!;

    const runtime: ApplicationRuntime = {
      /* Identity */

      id: context.id,

      name: context.name,

      version: context.version,

      startedAt: context.startedAt,

      /* Environment */

      environment: context.environment,

      hostname: context.hostname,

      processId: context.processId,

      nodeVersion: context.nodeVersion,

      platform: context.platform,

      architecture: context.architecture,

      workingDirectory: context.workingDirectory,

      /* Network */

      host: server.options.host,

      port: server.options.port,

      /* Kernel */

      kernel: this.kernel!,

      /* Instrumentation */

      instrumentation: this.instrumentation!,

      /* Application */

      application,

      /**
       * Solvia server abstraction.
       *
       * Contains:
       *
       * - lifecycle
       * - shutdown
       * - health
       * - runtime control
       */
      server,

      /**
       * Native HTTP transport.
       */
      httpServer: application.getHttpServer(),

      /* Capabilities */

      capabilities: this.buildCapabilities(),

      /* Diagnostics */

      ready: true,

      bootDuration: context.elapsedTime,

      metadata: this.buildMetadata(),

      /**
       * Delegates shutdown to ApplicationServer.
       */
      shutdown: () => server.stop(),
    };

    return Object.freeze(runtime);
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(): void {
    if (!this.context) {
      throw new Error(
        "ApplicationRuntimeBuilder: ApplicationContext is required.",
      );
    }

    if (!this.instrumentation) {
      throw new Error(
        "ApplicationRuntimeBuilder: InstrumentationRuntime is required.",
      );
    }

    if (!this.kernel) {
      throw new Error(
        "ApplicationRuntimeBuilder: BootstrapRuntime is required.",
      );
    }

    if (!this.application) {
      throw new Error(
        "ApplicationRuntimeBuilder: INestApplication is required.",
      );
    }

    if (!this.server) {
      throw new Error(
        "ApplicationRuntimeBuilder: ApplicationServer is required.",
      );
    }
  }

  /* ===========================================================================
   * Capabilities
   * ========================================================================= */

  private buildCapabilities(): ReadonlySet<string> {
    return new Set(["http"]);
  }

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  private buildMetadata(): Readonly<Record<string, unknown>> {
    return Object.freeze({});
  }
}

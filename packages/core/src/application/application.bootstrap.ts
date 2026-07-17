import type { INestApplication } from "@nestjs/common";

import { BootstrapLoader } from "../kernel/bootstrap/bootstrap.loader";
import type { BootstrapRuntime } from "../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import { ApplicationContext } from "./application.context";
import { ApplicationFactory } from "./application.factory";
import { ApplicationConfigurator } from "./application.configurator";

import type { ApplicationOptions } from "./contracts/application.options";
import type { ApplicationRuntime } from "./contracts/application.runtime";

import { ApplicationRuntimeBuilder } from "./application.runtime.builder";

import { ApplicationServer } from "./server/application.server";
import { ServerBuilder } from "./server/server.builder";

import { InstrumentationEngine } from "../instrumentation/instrumentation.engine";
import type { InstrumentationRuntime } from "../instrumentation/contracts/instrumentation-runtime";

import { InstrumentationShutdownHook } from "./server/shutdown/instrumentation.shutdown-hook";

/* =============================================================================
 * Application Bootstrap
 * =============================================================================
 *
 * Main application lifecycle orchestrator.
 *
 * Responsibilities:
 *
 * - Validate startup configuration
 * - Initialize instrumentation
 * - Start Kernel runtime
 * - Create application host
 * - Configure application
 * - Create server runtime
 * - Start server
 * - Produce immutable ApplicationRuntime
 *
 * Does NOT:
 *
 * - Create infrastructure manually
 * - Resolve dependencies
 * - Manage framework internals
 *
 * =============================================================================
 */

export class ApplicationBootstrap {
  private readonly context: ApplicationContext;

  private instrumentationEngine?: InstrumentationEngine;

  private instrumentation?: InstrumentationRuntime;

  private kernel?: BootstrapRuntime;

  private application?: INestApplication;

  private server?: ApplicationServer;

  private runtime?: ApplicationRuntime;

  private constructor(private readonly options: ApplicationOptions) {
    this.context = ApplicationContext.create(options);
  }

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(options: ApplicationOptions): ApplicationBootstrap {
    if (!options) {
      throw new Error("ApplicationBootstrap.create: options are required.");
    }

    return new ApplicationBootstrap(options);
  }

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  public async run(): Promise<ApplicationRuntime> {
    try {
      await this.bootstrap();

      return this.requireRuntime();
    } catch (error) {
      await this.abort(error);

      throw error;
    }
  }

  /* ===========================================================================
   * Bootstrap Pipeline
   * ========================================================================= */

  private async bootstrap(): Promise<void> {
    this.validate();

    this.context.transition("bootstrapping" as never);

    await this.initialize();

    await this.startInstrumentation();

    await this.startKernel();

    await this.createApplication();

    await this.configureApplication();

    await this.createServer();

    await this.configureServer();

    await this.startServer();

    await this.buildRuntime();

    await this.complete();
  }

  /* ===========================================================================
   * Initialization
   * ========================================================================= */

  protected async initialize(): Promise<void> {
    // Extension point.
  }

  /* ===========================================================================
   * Instrumentation
   * ========================================================================= */

  private async startInstrumentation(): Promise<void> {
    this.instrumentationEngine = InstrumentationEngine.create(
      this.options.instrumentation ?? {},
    );

    this.instrumentation = await this.instrumentationEngine.initialize();
  }

  /* ===========================================================================
   * Kernel
   * ========================================================================= */

  private async startKernel(): Promise<void> {
    this.kernel = await BootstrapLoader.loadAsync(this.options.bootstrap ?? {});

    this.context.attachKernel(this.kernel);
  }

  /* ===========================================================================
   * Application
   * ========================================================================= */

  private async createApplication(): Promise<void> {
    this.application = await ApplicationFactory.create(this.options);

    this.context.attachApplication(this.application);
  }

  private async configureApplication(): Promise<void> {
    await ApplicationConfigurator.create(this.options).configure(
      this.requireApplication(),
    );
  }

  /* ===========================================================================
   * Server
   * ========================================================================= */

  private async createServer(): Promise<void> {
    this.server = ServerBuilder.create(this.requireApplication())
      .withOptions(this.options.server)
      .build();
  }

  protected async configureServer(): Promise<void> {
    this.requireServer().registerShutdownHook(
      new InstrumentationShutdownHook(this.requireInstrumentationEngine()),
    );
  }

  private async startServer(): Promise<void> {
    await this.requireServer().start();
  }

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  private async buildRuntime(): Promise<void> {
    this.runtime = ApplicationRuntimeBuilder.create()
      .withContext(this.context)
      .withInstrumentation(this.requireInstrumentation())
      .withKernel(this.requireKernel())
      .withApplication(this.requireApplication())
      .withServer(this.requireServer())
      .build();
  }

  protected async complete(): Promise<void> {
    this.context.transition("running" as never);
  }

  /* ===========================================================================
   * Failure
   * ========================================================================= */

  protected async abort(error: unknown): Promise<void> {
    this.context.fail(
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(): void {
    if (!this.options.module) {
      throw new Error(
        "ApplicationBootstrap: root application module is required.",
      );
    }
  }

  /* ===========================================================================
   * Guards
   * ========================================================================= */

  private requireRuntime(): ApplicationRuntime {
    if (!this.runtime) {
      throw new Error("Application runtime was not created.");
    }

    return this.runtime;
  }

  private requireApplication(): INestApplication {
    if (!this.application) {
      throw new Error("Nest application is unavailable.");
    }

    return this.application;
  }

  private requireServer(): ApplicationServer {
    if (!this.server) {
      throw new Error("Application server is unavailable.");
    }

    return this.server;
  }

  private requireKernel(): BootstrapRuntime {
    if (!this.kernel) {
      throw new Error("Kernel runtime is unavailable.");
    }

    return this.kernel;
  }

  private requireInstrumentation(): InstrumentationRuntime {
    if (!this.instrumentation) {
      throw new Error("Instrumentation runtime is unavailable.");
    }

    return this.instrumentation;
  }

  private requireInstrumentationEngine(): InstrumentationEngine {
    if (!this.instrumentationEngine) {
      throw new Error("Instrumentation engine is unavailable.");
    }

    return this.instrumentationEngine;
  }
}

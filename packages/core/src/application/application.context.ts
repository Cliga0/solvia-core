import { randomUUID } from "node:crypto";
import os from "node:os";
import process from "node:process";

import type {
  HttpServer,
  INestApplication,
  LoggerService,
} from "@nestjs/common";

import type { BootstrapRuntime } from "../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import { ApplicationOptions } from "./contracts/application.options";

/* =============================================================================
 * Application Context
 * =============================================================================
 *
 * The ApplicationContext represents the living runtime state of the Solvia
 * application.
 *
 * A single instance exists during the entire application lifetime.
 *
 * It is progressively enriched as the application starts.
 *
 *      ApplicationBootstrap
 *                │
 *                ▼
 *      ApplicationContext
 *                │
 *        ├──────── Kernel Runtime
 *        ├──────── Nest Application
 *        ├──────── HTTP Server
 *        ├──────── Logger
 *        ├──────── Lifecycle
 *        ├──────── Diagnostics
 *        └──────── Shutdown
 *
 * Unlike ApplicationRuntime, this object is mutable and evolves while the
 * application executes.
 *
 * =============================================================================
 */

export class ApplicationContext {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  public readonly id = randomUUID();

  public readonly startedAt = new Date();

  /**
   * Application name.
   */
  public get name(): string {
    return this.options.name ?? "Solvia Application";
  }

  /**
   * Application version.
   */
  public get version(): string {
    return this.options.version ?? "0.0.0";
  }

  /**
   * Application metadata.
   */
  public get metadata(): Readonly<Record<string, unknown>> {
    return this.options.metadata ?? {};
  }

  /* ===========================================================================
   * Environment
   * ========================================================================= */

  public readonly processId = process.pid;

  public readonly hostname = os.hostname();

  public readonly platform = process.platform;

  public readonly architecture = os.arch();

  public readonly nodeVersion = process.version;

  public readonly workingDirectory = process.cwd();

  public get environment(): string {
    return this.options.environment ?? process.env.NODE_ENV ?? "development";
  }
  /* ===========================================================================
   * Configuration
   * ========================================================================= */

  public readonly options: Readonly<ApplicationOptions>;

  public get bootstrapOptions() {
    return this.options.bootstrap;
  }

  public get runtimeOptions() {
    return this.options.runtime;
  }

  public get serverOptions() {
    return this.options.server;
  }

  /* ===========================================================================
   * Kernel
   * ========================================================================= */

  private kernel?: BootstrapRuntime;

  /* ===========================================================================
   * Nest Application
   * ========================================================================= */

  private application?: INestApplication;

  /* ===========================================================================
   * HTTP Server
   * ========================================================================= */

  private server?: HttpServer;

  /* ===========================================================================
   * Logger
   * ========================================================================= */

  private logger?: LoggerService;

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  private state: ApplicationState = ApplicationState.CREATED;

  private lastError?: Error;

  /* ===========================================================================
   * Constructor
   * ========================================================================= */

  private constructor(options: ApplicationOptions) {
    this.options = Object.freeze({ ...options });
  }

  public static create(options: ApplicationOptions): ApplicationContext {
    return new ApplicationContext(options);
  }

  /* ===========================================================================
   * Kernel Runtime
   * ========================================================================= */

  public attachKernel(runtime: BootstrapRuntime): this {
    this.kernel = runtime;
    return this;
  }

  public getKernel(): BootstrapRuntime {
    if (!this.kernel) {
      throw new Error("Kernel runtime has not been initialized.");
    }

    return this.kernel;
  }

  /* ===========================================================================
   * Nest Application
   * ========================================================================= */

  public attachApplication(app: INestApplication): this {
    this.application = app;
    return this;
  }

  public getApplication(): INestApplication {
    if (!this.application) {
      throw new Error("Nest application has not been created.");
    }

    return this.application;
  }

  /* ===========================================================================
   * HTTP Server
   * ========================================================================= */

  public attachServer(server: HttpServer): this {
    this.server = server;
    return this;
  }

  public getServer(): HttpServer {
    if (!this.server) {
      throw new Error("HTTP server is unavailable.");
    }

    return this.server;
  }

  /* ===========================================================================
   * Logger
   * ========================================================================= */

  public attachLogger(logger: LoggerService): this {
    this.logger = logger;
    return this;
  }

  public getLogger(): LoggerService | undefined {
    return this.logger;
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  public transition(state: ApplicationState): this {
    this.state = state;
    return this;
  }

  public fail(error: Error): this {
    this.lastError = error;
    this.state = ApplicationState.FAILED;
    return this;
  }

  public getState(): ApplicationState {
    return this.state;
  }

  public is(state: ApplicationState): boolean {
    return this.state === state;
  }

  public getLastError(): Error | undefined {
    return this.lastError;
  }

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  public get uptime(): number {
    return process.uptime();
  }

  public get elapsedTime(): number {
    return Date.now() - this.startedAt.getTime();
  }

  public memoryUsage() {
    return process.memoryUsage();
  }

  public cpuUsage() {
    return process.cpuUsage();
  }

  /* ===========================================================================
   * Snapshot
   * ========================================================================= */

  public snapshot() {
    return Object.freeze({
      id: this.id,

      name: this.name,

      version: this.version,

      state: this.state,

      startedAt: this.startedAt,

      environment: this.environment,

      processId: this.processId,

      hostname: this.hostname,

      uptime: this.uptime,

      elapsedTime: this.elapsedTime,
    });
  }
}

/* =============================================================================
 * Application State
 * =============================================================================
 */

export enum ApplicationState {
  CREATED = "created",

  BOOTSTRAPPING = "bootstrapping",

  BUILDING_KERNEL = "building-kernel",

  CREATING_APPLICATION = "creating-application",

  CONFIGURING = "configuring",

  STARTING = "starting",

  RUNNING = "running",

  STOPPING = "stopping",

  STOPPED = "stopped",

  FAILED = "failed",
}

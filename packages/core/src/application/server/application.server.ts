import type { INestApplication } from "@nestjs/common";

import type { ServerOptions } from "./server.options";
import { ServerLifecycle } from "./server.lifecycle";

import { GracefulShutdown, type ShutdownHook } from "./graceful-shutdown";

import { ReadinessChecker } from "./health/readiness";
import { LivenessChecker } from "./health/liveness";

/* =============================================================================
 * Application Server
 * =============================================================================
 *
 * Runtime owner of the application HTTP server.
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * - Start HTTP runtime
 * - Coordinate graceful shutdown
 * - Own server lifecycle state
 * - Register shutdown participants
 * - Expose health information
 * - Expose runtime server metadata
 *
 *
 * Architecture boundary
 * ---------------------------------------------------------------------------
 *
 * ApplicationBootstrap
 *          |
 *          v
 *   ApplicationServer
 *          |
 *          +--> ServerLifecycle
 *          |
 *          +--> GracefulShutdown
 *          |
 *          +--> Nest Application
 *
 *
 * ApplicationServer does NOT know:
 *
 * - Database
 * - Cache
 * - Queue
 * - Instrumentation
 * - External infrastructure
 *
 * Those components participate through ShutdownHook.
 *
 * =============================================================================
 */

export class ApplicationServer {
  private constructor(
    private readonly application: INestApplication,

    public readonly options: ServerOptions,

    private readonly lifecycle: ServerLifecycle,

    private readonly shutdownCoordinator: GracefulShutdown,

    private readonly readiness: ReadinessChecker,

    private readonly liveness: LivenessChecker,
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    application: INestApplication,
    options: ServerOptions,
    lifecycle: ServerLifecycle,
    shutdownCoordinator: GracefulShutdown,
    readiness: ReadinessChecker,
    liveness: LivenessChecker,
  ): ApplicationServer {
    return new ApplicationServer(
      application,
      options,
      lifecycle,
      shutdownCoordinator,
      readiness,
      liveness,
    );
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Starts the HTTP server runtime.
   */
  public async start(): Promise<void> {
    if (this.lifecycle.isRunning()) {
      return;
    }

    try {
      this.lifecycle.starting();

      await this.application.listen(this.options.port, this.options.host);

      this.lifecycle.running();
    } catch (error) {
      this.lifecycle.failed(this.normalizeError(error));

      throw error;
    }
  }

  /**
   * Gracefully stops the server runtime.
   *
   * Shutdown orchestration is delegated to
   * GracefulShutdown.
   */
  public async stop(): Promise<void> {
    if (this.lifecycle.isStopped() || this.lifecycle.isStopping()) {
      return;
    }

    await this.shutdownCoordinator.shutdown();
  }

  /**
   * Performs the actual Nest application close.
   *
   * This method MUST only be called by
   * ServerShutdownHook.
   */
  public async close(): Promise<void> {
    await this.application.close();
  }

  /* ===========================================================================
   * Shutdown Registration
   * ========================================================================= */

  /**
   * Registers infrastructure shutdown participant.
   */
  public registerShutdownHook(hook: ShutdownHook): this {
    this.shutdownCoordinator.register(hook);

    return this;
  }

  /* ===========================================================================
   * Health
   * ========================================================================= */

  /**
   * Returns readiness information.
   */
  public readinessStatus() {
    return this.readiness.check();
  }

  /**
   * Returns liveness information.
   */
  public livenessStatus() {
    return this.liveness.check();
  }

  /* ===========================================================================
   * Runtime Information
   * ========================================================================= */

  /**
   * Returns immutable lifecycle snapshot.
   */
  public lifecycleSnapshot() {
    return this.lifecycle.snapshot();
  }

  /**
   * Returns underlying HTTP server instance.
   */
  public getHttpServer() {
    return this.application.getHttpServer();
  }

  /**
   * Returns configured server address.
   */
  public getAddress(): string {
    return `${this.options.host}:${this.options.port}`;
  }

  /**
   * Returns whether server is ready.
   */
  public isReady(): boolean {
    return this.lifecycle.isRunning();
  }

  /* ===========================================================================
   * Internal
   * ========================================================================= */

  private normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}

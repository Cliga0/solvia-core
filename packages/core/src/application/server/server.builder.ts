import type { INestApplication } from "@nestjs/common";

import { ApplicationServer } from "./application.server";

import { type ServerOptions } from "./server.options";

import { ServerLifecycle } from "./server.lifecycle";

import { NodeRuntimeSignals } from "./runtime/node-runtime-signals";

import type { RuntimeSignals } from "./runtime/runtime-signals";

import {
  GracefulShutdown,
  ShutdownHook,
  type GracefulShutdownOptions,
} from "./graceful-shutdown";

import { ReadinessChecker } from "./health/readiness";
import { LivenessChecker } from "./health/liveness";
import { ServerShutdownHook } from "./shutdown/server.shutdown-hook";

/* =============================================================================
 * Server Builder
 * =============================================================================
 *
 * Composes the complete Server Runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Normalize server options
 * • Validate server configuration
 * • Create lifecycle components
 * • Assemble ApplicationServer
 * • Hide infrastructure wiring
 *
 * The builder is the only component that knows how the server subsystem
 * is internally composed.
 *
 * Architecture
 * -----------------------------------------------------------------------------
 *
 *                 ApplicationBootstrap
 *                          │
 *                          ▼
 *                    ServerBuilder
 *                          │
 *          ┌───────────────┼────────────────┐
 *          ▼               ▼                ▼
 *   ServerLifecycle   GracefulShutdown   Health
 *          │               │                │
 *          └───────────────┼────────────────┘
 *                          ▼
 *                  ApplicationServer
 *
 * =============================================================================
 */

export class ServerBuilder {
  private options: ServerOptions = this.defaults();

  private constructor(private readonly application: INestApplication) {}

  /**
   * Factory.
   */
  public static create(application: INestApplication): ServerBuilder {
    return new ServerBuilder(application);
  }

  /**
   * Server configuration.
   */
  public withOptions(options: Partial<ServerOptions> = {}): this {
    this.options = this.normalize(options);

    return this;
  }

  private createSignals(): RuntimeSignals {
    return NodeRuntimeSignals.create();
  }

  /**
   * Builds the complete server runtime.
   */
  public build(): ApplicationServer {
    this.validate();

    const lifecycle = this.createLifecycle();

    const signals = this.createSignals();

    const shutdown = this.createShutdown(lifecycle, signals);

    const readiness = this.createReadiness(lifecycle);

    const liveness = this.createLiveness(lifecycle);

    const server = ApplicationServer.create(
      this.application,
      this.options,
      lifecycle,
      shutdown,
      readiness,
      liveness,
    );

    this.configureShutdown(server);

    return server;
  }

  /**
   * ---------------------------------------------------------------------------
   * Lifecycle
   * ---------------------------------------------------------------------------
   */

  private createLifecycle(): ServerLifecycle {
    return ServerLifecycle.create();
  }

  /**
   * ---------------------------------------------------------------------------
   * Shutdown
   * ---------------------------------------------------------------------------
   */

  private createShutdown(
    lifecycle: ServerLifecycle,
    signals: RuntimeSignals,
  ): GracefulShutdown {
    const options: GracefulShutdownOptions = {
      enableSignals: this.options.shutdown?.enabled ?? true,

      timeoutMs: this.options.shutdown?.timeoutMs ?? 30_000,
    };

    return GracefulShutdown.create(lifecycle, signals, options);
  }

  /**
   * ---------------------------------------------------------------------------
   * Readiness
   * ---------------------------------------------------------------------------
   */

  private createReadiness(lifecycle: ServerLifecycle): ReadinessChecker {
    return ReadinessChecker.create(lifecycle);
  }

  /**
   * ---------------------------------------------------------------------------
   * Liveness
   * ---------------------------------------------------------------------------
   */

  private createLiveness(lifecycle: ServerLifecycle): LivenessChecker {
    return LivenessChecker.create(lifecycle);
  }

  /**
   * ---------------------------------------------------------------------------
   * Validation
   * ---------------------------------------------------------------------------
   */

  private validate(): void {
    const { host, port } = this.options;

    if (!Number.isInteger(port)) {
      throw new Error("ServerBuilder: server port must be an integer.");
    }

    if (port < 0 || port > 65_535) {
      throw new Error(
        "ServerBuilder: server port must be between 0 and 65535.",
      );
    }

    if (host.trim().length === 0) {
      throw new Error("ServerBuilder: server host is required.");
    }
  }

  /**
   * ---------------------------------------------------------------------------
   * Normalize
   * ---------------------------------------------------------------------------
   */

  private normalize(options: Partial<ServerOptions>): ServerOptions {
    return {
      ...this.defaults(),

      ...options,

      shutdown: {
        ...this.defaults().shutdown,

        ...options.shutdown,
      },

      health: {
        ...this.defaults().health,

        ...options.health,
      },
    };
  }

  /**
   * ---------------------------------------------------------------------------
   * Defaults
   * ---------------------------------------------------------------------------
   */

  private defaults(): ServerOptions {
    return {
      host: "0.0.0.0",

      port: 3000,

      shutdown: {
        enabled: true,

        timeoutMs: 30_000,
      },

      health: {
        enabled: true,

        readiness: true,

        liveness: true,
      },

      metadata: {},
    };
  }

  private createServerShutdownHook(server: ApplicationServer): ShutdownHook {
    return new ServerShutdownHook(server);
  }

  private configureShutdown(server: ApplicationServer): void {
    server.registerShutdownHook(this.createServerShutdownHook(server));
  }
}

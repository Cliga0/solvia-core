import type { INestApplication, HttpServer } from "@nestjs/common";

import type { BootstrapRuntime } from "../../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import type { InstrumentationRuntime } from "../../instrumentation/contracts/instrumentation-runtime";

import type { ApplicationServer } from "../server/application.server";

/* =============================================================================
 * Application Runtime
 * =============================================================================
 *
 * Immutable operational representation of a running Solvia application.
 *
 * Produced at the end of the Application Bootstrap pipeline.
 *
 *
 * Architecture:
 *
 *
 * ApplicationBootstrap
 *
 *        |
 *        v
 *
 * ApplicationRuntime
 *
 *        |
 *        +-----------------------+
 *        |                       |
 *        v                       v
 *
 * ApplicationServer        Nest Application
 *
 *
 *
 * Responsibilities:
 *
 * - Expose application identity
 * - Expose runtime metadata
 * - Expose Kernel runtime
 * - Expose instrumentation runtime
 * - Expose Solvia server abstraction
 * - Provide stable operational contract
 *
 *
 * The runtime:
 *
 * - NEVER performs bootstrap
 * - NEVER mutates lifecycle
 * - NEVER owns initialization
 *
 * It is immutable and safe to share.
 *
 * =============================================================================
 */

export interface ApplicationRuntime {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  /**
   * Unique runtime identifier.
   */
  readonly id: string;

  /**
   * Application name.
   */
  readonly name?: string;

  /**
   * Application version.
   */
  readonly version: string;

  /**
   * Runtime creation timestamp.
   */
  readonly startedAt: Date;

  /* ===========================================================================
   * Environment
   * ========================================================================= */

  /**
   * Runtime environment.
   */
  readonly environment: string;

  /**
   * Host machine name.
   */
  readonly hostname: string;

  /**
   * Node process identifier.
   */
  readonly processId: number;

  /**
   * Node.js version.
   */
  readonly nodeVersion: string;

  /**
   * Operating system.
   */
  readonly platform: NodeJS.Platform;

  /**
   * CPU architecture.
   */
  readonly architecture: string;

  /**
   * Process working directory.
   */
  readonly workingDirectory: string;

  /* ===========================================================================
   * Network
   * ========================================================================= */

  /**
   * Server host.
   */
  readonly host: string;

  /**
   * Server port.
   */
  readonly port: number;

  /* ===========================================================================
   * Kernel
   * ========================================================================= */

  /**
   * Solvia Kernel runtime.
   */
  readonly kernel: BootstrapRuntime;

  /* ===========================================================================
   * Instrumentation
   * ========================================================================= */

  /**
   * Runtime instrumentation.
   */
  readonly instrumentation: InstrumentationRuntime;

  /* ===========================================================================
   * Application Runtime
   * ========================================================================= */

  /**
   * Solvia application server abstraction.
   *
   * Provides:
   *
   * - lifecycle control
   * - graceful shutdown
   * - health checks
   * - server metadata
   */
  readonly server: ApplicationServer;

  /**
   * Native Nest application.
   */
  readonly application: INestApplication;

  /**
   * Raw HTTP server.
   *
   * Exposed only for low-level integrations.
   */
  readonly httpServer: HttpServer;

  /* ===========================================================================
   * Capabilities
   * ========================================================================= */

  /**
   * Enabled runtime capabilities.
   */
  readonly capabilities: ReadonlySet<string>;

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  /**
   * Application readiness marker.
   */
  readonly ready: true;

  /**
   * Bootstrap duration in milliseconds.
   */
  readonly bootDuration: number;

  /**
   * Runtime metadata.
   */
  readonly metadata: Readonly<Record<string, unknown>>;

  /* ===========================================================================
   * Shutdown
   * ========================================================================= */

  /**
   * Graceful application shutdown.
   */
  shutdown(): Promise<void>;
}

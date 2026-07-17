/* =============================================================================
 * Graceful Shutdown
 * =============================================================================
 *
 * Production-grade shutdown coordinator.
 *
 * Responsibilities:
 *
 * - Coordinate application shutdown
 * - Handle OS termination signals
 * - Execute ordered shutdown hooks
 * - Guarantee single execution
 * - Enforce shutdown deadline
 * - Maintain shutdown state
 *
 * Does NOT:
 *
 * - Own infrastructure resources
 * - Know concrete services
 * - Force process termination
 *
 * =============================================================================
 */

import type { RuntimeSignals } from "./runtime/runtime-signals";

import { ServerLifecycle } from "./server.lifecycle";

/* =============================================================================
 * Shutdown Hook Contract
 * =============================================================================
 */

export interface ShutdownHook {
  /**
   * Unique hook identifier.
   */
  readonly name: string;

  /**
   * Execution priority.
   *
   * Higher values execute first.
   */
  readonly priority?: number;

  /**
   * Cleanup operation.
   */
  shutdown(): Promise<void>;
}

/* =============================================================================
 * Shutdown Options
 * =============================================================================
 */

export interface GracefulShutdownOptions {
  /**
   * Maximum shutdown duration.
   */
  readonly timeoutMs?: number;

  /**
   * Enable OS signal handling.
   */
  readonly enableSignals?: boolean;

  /**
   * Optional shutdown observer.
   */
  readonly onError?: (error: Error, hook?: ShutdownHook) => void;
}

/* =============================================================================
 * Shutdown State
 * =============================================================================
 */

export enum ShutdownState {
  IDLE = "idle",

  RUNNING = "running",

  COMPLETED = "completed",

  FAILED = "failed",
}

/* =============================================================================
 * Graceful Shutdown Coordinator
 * =============================================================================
 */

export class GracefulShutdown {
  private readonly hooks = new Map<string, ShutdownHook>();

  private shutdownPromise?: Promise<void>;

  private state = ShutdownState.IDLE;

  private constructor(
    private readonly lifecycle: ServerLifecycle,

    private readonly signals: RuntimeSignals,

    private readonly options: GracefulShutdownOptions = {},
  ) {}

  /* ---------------------------------------------------------------------------
   * Factory
   * ------------------------------------------------------------------------- */

  public static create(
    lifecycle: ServerLifecycle,
    signals: RuntimeSignals,
    options: GracefulShutdownOptions = {},
  ): GracefulShutdown {
    const instance = new GracefulShutdown(lifecycle, signals, options);

    if (options.enableSignals ?? true) {
      instance.registerSignals();
    }

    return instance;
  }

  /* ---------------------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------------------- */

  public register(hook: ShutdownHook): this {
    this.hooks.set(hook.name, hook);

    return this;
  }

  public shutdown(): Promise<void> {
    if (!this.shutdownPromise) {
      this.shutdownPromise = this.executeShutdown();
    }

    return this.shutdownPromise;
  }

  public getState(): ShutdownState {
    return this.state;
  }

  /* ---------------------------------------------------------------------------
   * Shutdown Pipeline
   * ------------------------------------------------------------------------- */

  private async executeShutdown(): Promise<void> {
    if (this.lifecycle.isStopping() || this.lifecycle.isStopped()) {
      return;
    }

    this.state = ShutdownState.RUNNING;

    try {
      this.lifecycle.stopping();

      await this.executeWithTimeout();

      this.lifecycle.stopped();

      this.state = ShutdownState.COMPLETED;
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));

      this.state = ShutdownState.FAILED;

      this.lifecycle.failed(normalized);

      throw normalized;
    }
  }

  /* ---------------------------------------------------------------------------
   * Hook execution
   * ------------------------------------------------------------------------- */

  private async executeHooks(): Promise<void> {
    const hooks = [...this.hooks.values()].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );

    for (const hook of hooks) {
      try {
        await hook.shutdown();
      } catch (error) {
        const normalized =
          error instanceof Error ? error : new Error(String(error));

        this.options.onError?.(normalized, hook);
      }
    }
  }

  /* ---------------------------------------------------------------------------
   * Timeout control
   * ------------------------------------------------------------------------- */

  private async executeWithTimeout(): Promise<void> {
    const timeout = this.options.timeoutMs ?? 30_000;

    await Promise.race([this.executeHooks(), this.createTimeout(timeout)]);
  }

  private createTimeout(timeoutMs: number): Promise<void> {
    return new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Graceful shutdown timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      timer.unref?.();
    });
  }

  /* ---------------------------------------------------------------------------
   * Signals
   * ------------------------------------------------------------------------- */

  private registerSignals(): void {
    this.signals.on("SIGTERM", this.signalHandler);

    this.signals.on("SIGINT", this.signalHandler);
  }

  private readonly signalHandler = (): void => {
    void this.shutdown();
  };
}

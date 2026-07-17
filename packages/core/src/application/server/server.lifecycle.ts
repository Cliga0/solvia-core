/* =============================================================================
 * Server Lifecycle
 * =============================================================================
 *
 * Stateful lifecycle controller for the Solvia server runtime.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Track runtime state
 * • Validate lifecycle transitions
 * • Record lifecycle history
 * • Capture timestamps
 * • Expose immutable runtime snapshots
 * • Report runtime failures
 *
 * This component intentionally owns no infrastructure.
 *
 * It does NOT:
 *
 * • Start the HTTP server
 * • Stop the HTTP server
 * • Listen to OS signals
 * • Know anything about NestJS
 *
 * =============================================================================
 */

import type { ServerHealthContext } from "./health/server-health.context";

/* =============================================================================
 * Server State
 * =============================================================================
 */

export enum ServerState {
  CREATED = "created",

  STARTING = "starting",

  RUNNING = "running",

  STOPPING = "stopping",

  STOPPED = "stopped",

  FAILED = "failed",
}

/* =============================================================================
 * Lifecycle Event
 * =============================================================================
 */

export interface ServerLifecycleEvent {
  readonly from: ServerState;

  readonly to: ServerState;

  readonly timestamp: Date;

  readonly error?: Error;
}

/* =============================================================================
 * Lifecycle Snapshot
 * =============================================================================
 */

export interface ServerLifecycleSnapshot {
  readonly state: ServerState;

  readonly createdAt: Date;

  readonly startedAt?: Date;

  readonly stoppedAt?: Date;

  readonly failedAt?: Date;

  readonly uptime: number;

  readonly error?: Error;

  readonly history: readonly Readonly<ServerLifecycleEvent>[];
}

/* =============================================================================
 * Server Lifecycle
 * =============================================================================
 */

export class ServerLifecycle implements ServerHealthContext {
  /**
   * Allowed lifecycle transitions.
   */
  private static readonly TRANSITIONS: Readonly<
    Record<ServerState, ReadonlySet<ServerState>>
  > = {
    [ServerState.CREATED]: new Set([ServerState.STARTING, ServerState.FAILED]),

    [ServerState.STARTING]: new Set([ServerState.RUNNING, ServerState.FAILED]),

    [ServerState.RUNNING]: new Set([ServerState.STOPPING, ServerState.FAILED]),

    [ServerState.STOPPING]: new Set([ServerState.STOPPED, ServerState.FAILED]),

    [ServerState.STOPPED]: new Set(),

    [ServerState.FAILED]: new Set([ServerState.STOPPING, ServerState.STARTING]),
  };

  private state = ServerState.CREATED;

  private readonly createdAt = new Date();

  private startedAt?: Date;

  private stoppedAt?: Date;

  private failedAt?: Date;

  private failure?: Error;

  private readonly history: ServerLifecycleEvent[] = [];

  private constructor() {}

  /**
   * Factory.
   */
  public static create(): ServerLifecycle {
    return new ServerLifecycle();
  }

  /* ---------------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------------- */

  public get current(): ServerState {
    return this.state;
  }

  public isCreated(): boolean {
    return this.state === ServerState.CREATED;
  }

  public isStarting(): boolean {
    return this.state === ServerState.STARTING;
  }

  public isRunning(): boolean {
    return this.state === ServerState.RUNNING;
  }

  public isStopping(): boolean {
    return this.state === ServerState.STOPPING;
  }

  public isStopped(): boolean {
    return this.state === ServerState.STOPPED;
  }

  public hasFailed(): boolean {
    return this.state === ServerState.FAILED;
  }

  public isTerminal(): boolean {
    return (
      this.state === ServerState.STOPPED || this.state === ServerState.FAILED
    );
  }

  public get isStarted(): boolean {
    return this.isRunning();
  }

  /* ---------------------------------------------------------------------------
   * Lifecycle
   * ------------------------------------------------------------------------- */

  public starting(): this {
    return this.transition(ServerState.STARTING);
  }

  public running(): this {
    return this.transition(ServerState.RUNNING);
  }

  public stopping(): this {
    return this.transition(ServerState.STOPPING);
  }

  public stopped(): this {
    return this.transition(ServerState.STOPPED);
  }

  public failed(error: Error): this {
    return this.transition(ServerState.FAILED, error);
  }

  /* ---------------------------------------------------------------------------
   * Snapshot
   * ------------------------------------------------------------------------- */

  public snapshot(): ServerLifecycleSnapshot {
    return Object.freeze({
      state: this.state,

      createdAt: this.createdAt,

      startedAt: this.startedAt,

      stoppedAt: this.stoppedAt,

      failedAt: this.failedAt,

      uptime: this.calculateUptime(),

      error: this.failure,

      history: Object.freeze(
        this.history.map((event) =>
          Object.freeze({
            ...event,
          }),
        ),
      ),
    });
  }

  /* ---------------------------------------------------------------------------
   * Transition Engine
   * ------------------------------------------------------------------------- */

  private transition(next: ServerState, error?: Error): this {
    this.assertTransition(this.state, next);

    const now = new Date();

    switch (next) {
      case ServerState.RUNNING:
        this.startedAt ??= now;
        break;

      case ServerState.STOPPED:
        this.stoppedAt ??= now;
        break;

      case ServerState.FAILED:
        this.failedAt ??= now;
        this.failure = error;
        break;
    }

    this.history.push({
      from: this.state,
      to: next,
      timestamp: now,
      error,
    });

    this.state = next;

    return this;
  }

  /* ---------------------------------------------------------------------------
   * Validation
   * ------------------------------------------------------------------------- */

  private assertTransition(from: ServerState, to: ServerState): void {
    const allowed = ServerLifecycle.TRANSITIONS[from];

    if (allowed.has(to)) {
      return;
    }

    throw new Error(
      [
        "Invalid server lifecycle transition.",
        `Current state : ${from}`,
        `Requested     : ${to}`,
      ].join("\n"),
    );
  }

  /* ---------------------------------------------------------------------------
   * Runtime
   * ------------------------------------------------------------------------- */

  private calculateUptime(): number {
    if (!this.startedAt) {
      return 0;
    }

    const end = this.stoppedAt?.getTime() ?? Date.now();

    return end - this.startedAt.getTime();
  }
}

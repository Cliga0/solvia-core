import type { BootstrapAction } from "../contracts/bootstrap-action";
import type { BootstrapPhase } from "../contracts/bootstrap-phase";

/* =============================================================================
 * Bootstrap Action Registry
 * =============================================================================
 *
 * Immutable capability catalog for bootstrap execution.
 *
 * The registry is the authoritative source of executable bootstrap actions.
 *
 *
 * Lifecycle:
 *
 * CREATE
 *   |
 * REGISTER
 *   |
 * SEAL
 *   |
 * EXECUTE
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • register actions
 * • validate action contracts
 * • prevent duplicate ownership
 * • resolve actions
 * • freeze execution capabilities
 * • expose diagnostics snapshots
 *
 *
 * Does NOT:
 *
 * • execute actions
 * • control lifecycle
 * • order phases
 * • mutate runtime context
 *
 * =============================================================================
 */

export class BootstrapActionRegistry {
  /**
   * Internal action catalog.
   */
  private readonly catalog = new Map<string, BootstrapAction>();
  /**
   * Registry lifecycle state.
   */
  private sealed = false;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor() {}

  /**
   * Factory.
   */
  public static create(): BootstrapActionRegistry {
    return new BootstrapActionRegistry();
  }

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  /**
   * Register one action.
   */
  public register(action: BootstrapAction): this {
    this.assertMutable();

    this.validate(action);

    const key = this.identity(action.phase);

    if (this.catalog.has(key)) {
      throw new Error(`Bootstrap phase "${key}" already owns an action.`);
    }

    this.catalog.set(key, action);

    return this;
  }

  /**
   * Register many actions.
   */
  public registerMany(actions: readonly BootstrapAction[]): this {
    for (const action of actions) {
      this.register(action);
    }

    return this;
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Freeze registry.
   *
   * After sealing no mutation is allowed.
   */
  public seal(): this {
    this.sealed = true;

    return this;
  }

  public get isSealed(): boolean {
    return this.sealed;
  }

  /* ===========================================================================
   * Resolution
   * ========================================================================= */

  /**
   * Resolve action for phase.
   */
  public resolve(phase: BootstrapPhase): BootstrapAction {
    const action = this.catalog.get(this.identity(phase));

    if (!action) {
      throw new Error(
        `No BootstrapAction registered for phase "${phase.name}".`,
      );
    }

    return action;
  }

  /**
   * Check availability.
   */
  public has(phase: BootstrapPhase): boolean {
    return this.catalog.has(this.identity(phase));
  }

  /* ===========================================================================
   * Inspection
   * ========================================================================= */

  /**
   * All actions snapshot.
   */
  public all(): readonly BootstrapAction[] {
    return Object.freeze([...this.catalog.values()]);
  }

  /**
   * Registry snapshot.
   */
  public snapshot() {
    return Object.freeze({
      sealed: this.sealed,

      size: this.catalog.size,

      phases: Object.freeze([...this.catalog.keys()]),

      actions: this.all(),
    });
  }

  public get size(): number {
    return this.catalog.size;
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private validate(action: BootstrapAction): void {
    if (!action) {
      throw new Error("Cannot register undefined BootstrapAction.");
    }

    if (!action.phase) {
      throw new Error("BootstrapAction requires a phase.");
    }

    if (typeof action.execute !== "function") {
      throw new Error(
        `BootstrapAction "${action.phase.name}" requires execute().`,
      );
    }

    if (!action.phase.name || typeof action.phase.name !== "string") {
      throw new Error("Bootstrap phase requires a valid identity.");
    }
  }

  /* ===========================================================================
   * Internal
   * ========================================================================= */

  private identity(phase: BootstrapPhase): string {
    return phase.name;
  }

  private assertMutable(): void {
    if (this.sealed) {
      throw new Error(
        "BootstrapActionRegistry is sealed and cannot be modified.",
      );
    }
  }
}

import type { BootstrapAction } from "./contracts/bootstrap-action";

import type { BootstrapRuntimeContext } from "./runtime/contracts/bootstrap-runtime-context";

/* =============================================================================
 * Phase Executor
 * =============================================================================
 *
 * Execution boundary for one BootstrapAction.
 *
 * PhaseExecutor owns the operational lifecycle surrounding action execution.
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • execute one bootstrap action
 * • manage phase lifecycle transitions
 * • capture execution failures
 * • provide instrumentation boundary
 * • preserve execution consistency
 *
 *
 * Does NOT:
 *
 * • build bootstrap plans
 * • order phases
 * • resolve actions
 * • manage bootstrap orchestration
 *
 * =============================================================================
 */

export class PhaseExecutor {
  /**
   * Shared bootstrap runtime context.
   */
  public readonly context: BootstrapRuntimeContext;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  public constructor(context: BootstrapRuntimeContext) {
    this.context = context;
  }

  /* ===========================================================================
   * Execution
   * ========================================================================= */

  /**
   * Execute one bootstrap action.
   */
  public async execute(action: BootstrapAction): Promise<void> {
    const phase = action.phase;

    this.beforePhase(phase);

    try {
      await action.execute(this.context);

      this.afterPhase(phase);
    } catch (error) {
      this.onFailure(
        phase,
        error instanceof Error ? error : new Error(String(error)),
      );

      throw error;
    }
  }

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Called before phase execution.
   */
  protected beforePhase(phase: BootstrapAction["phase"]): void {
    this.context.enterPhase(phase);
  }

  /**
   * Called after successful phase execution.
   */
  protected afterPhase(phase: BootstrapAction["phase"]): void {
    this.context.completePhase(phase);
  }

  /**
   * Called when phase execution fails.
   */
  protected onFailure(phase: BootstrapAction["phase"], error: Error): void {
    this.context.failPhase(phase, error);
  }
}

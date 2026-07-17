import type { ContributionContext } from "../contracts/contribution-context";
import type { ContributionRuntime } from "../runtime/contribution-runtime";
import type { KernelContribution } from "../contracts/kernel-contribution";
import type { ContributionHooks } from "./contribution.hooks";

/* =============================================================================
 * Contribution Lifecycle
 * =============================================================================
 *
 * Orchestrates the lifecycle of a single Kernel contribution.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Execute lifecycle hooks
 * • Maintain lifecycle state
 * • Handle failures
 * • Perform rollback
 *
 * Does NOT:
 *
 * • discover contributions
 * • resolve dependencies
 * • register contributions
 * • build runtimes
 *
 * =============================================================================
 */

export class ContributionLifecycle {
  /**
   * Whether the contribution completed the load phase.
   */
  private loaded = false;

  /**
   * Whether the contribution completed the start phase.
   */
  private started = false;

  private constructor(
    private readonly contribution: KernelContribution,
    private readonly context: ContributionContext,
  ) {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    contribution: KernelContribution,
    context: ContributionContext,
  ): ContributionLifecycle {
    return new ContributionLifecycle(contribution, context);
  }

  /* ===========================================================================
   * Load
   * ========================================================================= */

  public async load(): Promise<void> {
    const hooks = this.getHooks();

    try {
      await hooks.beforeLoad?.(this.context);

      await hooks.load?.(this.context);

      await hooks.afterLoad?.(this.context);

      this.loaded = true;
    } catch (error) {
      await this.notifyError(error);

      throw error;
    }
  }

  /* ===========================================================================
   * Start
   * ========================================================================= */

  public async start(runtime: ContributionRuntime): Promise<void> {
    const hooks = this.getHooks();

    try {
      await hooks.beforeStart?.(this.context);

      await hooks.start?.(runtime);

      this.started = true;
    } catch (error) {
      await this.notifyError(error);

      await this.rollback(runtime);

      throw error;
    }
  }

  /* ===========================================================================
   * Ready
   * ========================================================================= */

  public async ready(runtime: ContributionRuntime): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.getHooks().ready?.(runtime);
  }

  /* ===========================================================================
   * Stop
   * ========================================================================= */

  public async stop(runtime: ContributionRuntime): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.getHooks().stop?.(runtime);

    this.started = false;
  }

  /* ===========================================================================
   * Destroy
   * ========================================================================= */

  public async destroy(): Promise<void> {
    if (!this.loaded) {
      return;
    }

    await this.getHooks().destroy?.(this.context);

    this.started = false;
    this.loaded = false;
  }

  /* ===========================================================================
   * Rollback
   * ========================================================================= */

  private async rollback(runtime: ContributionRuntime): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      await this.getHooks().stop?.(runtime);
    } catch {
      // rollback must never fail
    }

    this.started = false;
  }

  /* ===========================================================================
   * Error notification
   * ========================================================================= */

  private async notifyError(error: unknown): Promise<void> {
    const exception = error instanceof Error ? error : new Error(String(error));

    try {
      await this.getHooks().error?.(exception, this.context);
    } catch {
      // error handlers must never interrupt lifecycle
    }
  }

  /* ===========================================================================
   * Helpers
   * ========================================================================= */

  private getHooks(): ContributionHooks {
    return this.contribution.hooks ?? {};
  }
}

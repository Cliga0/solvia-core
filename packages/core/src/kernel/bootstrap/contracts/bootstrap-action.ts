import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPhase } from "./bootstrap-phase";

/* =============================================================================
 * Bootstrap Action
 * =============================================================================
 *
 * Represents one executable bootstrap unit.
 *
 * A BootstrapAction encapsulates the infrastructure logic associated with one
 * BootstrapPhase.
 *
 * The Bootstrap Engine never performs infrastructure work directly.
 *
 * Instead it delegates execution to BootstrapAction implementations.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • execute one bootstrap phase
 * • receive the shared runtime context
 * • mutate the runtime through the context
 * • expose immutable phase metadata
 *
 * It does NOT:
 *
 * • decide execution order
 * • validate dependencies
 * • orchestrate the bootstrap
 * • execute other actions
 *
 * Those responsibilities belong respectively to:
 *
 * • BootstrapBuilder
 * • BootstrapValidator
 * • BootstrapExecutor
 *
 * =============================================================================
 *
 * Bootstrap Lifecycle
 *
 *      BootstrapPlan
 *             │
 *             ▼
 *      BootstrapStep
 *             │
 *             ▼
 *      BootstrapAction
 *             │
 *             ▼
 *     Infrastructure Engine
 *
 * =============================================================================
 */

export interface BootstrapAction {
  /**
   * Phase associated with this action.
   */
  readonly phase: BootstrapPhase;

  /**
   * Executes the infrastructure work associated with the phase.
   *
   * The RuntimeContext is the only mutable object shared across every
   * bootstrap stage.
   */
  execute(context: BootstrapRuntimeContext): Promise<void>;
}

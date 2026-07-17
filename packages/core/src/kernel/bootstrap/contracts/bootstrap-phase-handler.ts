import type { BootstrapRuntimeContext } from "./../runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPhase } from "./bootstrap-phase";

/* =============================================================================
 * Bootstrap Phase Handler
 * =============================================================================
 *
 * Defines the contract responsible for executing a single Bootstrap phase.
 *
 * A Phase Handler encapsulates every cross-cutting concern involved in
 * executing one bootstrap stage while keeping BootstrapHandler focused on
 * orchestration only.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Execute one bootstrap phase
 * • Coordinate lifecycle transitions
 * • Handle execution failures
 * • Provide execution observability
 * • Preserve deterministic execution semantics
 *
 * It does NOT:
 *
 * • build execution plans
 * • validate execution plans
 * • orchestrate multiple phases
 * * know Bootstrap business logic
 *
 * =============================================================================
 */

export interface BootstrapPhaseHandler {
  /**
   * Shared bootstrap runtime context.
   */
  readonly context: BootstrapRuntimeContext;

  /**
   * Execute a single bootstrap phase.
   *
   * The supplied action represents the infrastructure work associated with
   * the phase.
   *
   * Implementations are responsible for:
   *
   * • entering the phase
   * • executing the action
   * • completing the phase
   * • reporting failures
   * • collecting diagnostics
   */
  execute(phase: BootstrapPhase, action: () => Promise<void>): Promise<void>;
}

import { BootstrapContext } from "../../contracts/bootstrap-context";
import { DiscoveryResult } from "../contracts/discovery-result";

/**
 * =============================================================================
 * Bootstrap Discovery Contract
 * =============================================================================
 *
 * Defines how runtime components are discovered.
 *
 * A discovery implementation can:
 *  - scan filesystem modules
 *  - load plugin registries
 *  - resolve metadata graphs
 *  - fetch remote extensions
 *
 * This is a PURE contract. No orchestration logic.
 * =============================================================================
 */
export interface BootstrapDiscovery {

  /**
   * Stable discovery identifier.
   */
  readonly name: string;


  /**
   * Execution priority.
   */
  readonly order: number;

  /**
   * Executes discovery for a given context.
   *
   * Must be deterministic (same input → same output).
   */
  discover(context: BootstrapContext): Promise<DiscoveryResult> | DiscoveryResult;
}
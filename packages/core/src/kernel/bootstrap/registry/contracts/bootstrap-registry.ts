import type { BootstrapContext } from "../../contracts/bootstrap-context";
import type { RegistryFragment } from "./registry-fragment";


/* =============================================================================
 * Bootstrap Registry
 * =============================================================================
 *
 * Contract implemented by every Kernel registry strategy.
 *
 * A registry transforms Kernel artifacts into registry fragments.
 *
 * The RegistryEngine owns aggregation.
 *
 * =============================================================================
 */


export interface BootstrapRegistry {


  /**
   * Stable registry identifier.
   */
  readonly name: string;



  /**
   * Execution priority.
   *
   * Lower executes first.
   */
  readonly order: number;



  /**
   * Creates registry fragment.
   */
  register(
    context: BootstrapContext,
  ): Promise<RegistryFragment>;

}
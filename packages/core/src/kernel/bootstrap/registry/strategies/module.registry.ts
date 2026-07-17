import type { ImportType } from "../../types/import.type";

import type { BootstrapContext } from "../../contracts/bootstrap-context";
import type { BootstrapModule } from "../../contracts/bootstrap-module";

import type { RegistryFragment } from "../contracts/registry-fragment";
import type { BootstrapRegistry } from "../contracts/bootstrap-registry";

/* =============================================================================
 * Module Registry
 * =============================================================================
 *
 * Registry strategy responsible for assembling the Kernel module graph.
 *
 * ModuleRegistry collects every module participating in the bootstrap process,
 * regardless of whether it originates from Discovery or from the Contribution
 * Manager.
 *
 * It produces an immutable registry fragment consumed later by the Registry
 * Engine.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • collect discovered modules
 * • collect contributed imports
 * • normalize module references
 * • eliminate duplicate registrations
 * • preserve deterministic ordering
 *
 * It does NOT:
 *
 * • discover modules
 * • instantiate modules
 * • create DynamicModules
 * • bootstrap NestJS
 *
 * =============================================================================
 */

export class ModuleRegistry implements BootstrapRegistry {
  /**
   * Registry identity.
   */
  public readonly name = "module";

  /**
   * Registry execution priority.
   */
  public readonly order = 10;

  /**
   * ---------------------------------------------------------------------------
   * Build module registry fragment.
   * ---------------------------------------------------------------------------
   */
  public async register(context: BootstrapContext): Promise<RegistryFragment> {
    const discovered = context.discovery?.modules ?? [];

    const contributed = context.contributions?.imports() ?? [];

    return Object.freeze({
      imports: this.merge(this.normalize(discovered), contributed),
    });
  }

  /**
   * ---------------------------------------------------------------------------
   * Normalize BootstrapModule descriptors.
   *
   * Converts Kernel BootstrapModule descriptors into ImportType references.
   *
   * ---------------------------------------------------------------------------
   */
  private normalize(
    modules: readonly BootstrapModule[],
  ): readonly ImportType[] {
    return modules.map((module) => module.module);
  }

  /**
   * ---------------------------------------------------------------------------
   * Merge module collections while preserving registration order.
   * ---------------------------------------------------------------------------
   */
  private merge(
    ...collections: readonly (readonly ImportType[])[]
  ): readonly ImportType[] {
    const result: ImportType[] = [];

    const seen = new Set<ImportType>();

    for (const collection of collections) {
      for (const module of collection) {
        if (seen.has(module)) {
          continue;
        }

        seen.add(module);

        result.push(module);
      }
    }

    return Object.freeze(result);
  }
}

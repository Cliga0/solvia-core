import type { KernelContribution } from "../contracts/kernel-contribution";
import type { ContributionRuntime } from "../runtime/contribution-runtime";

import { ContributionStore } from "./contribution.store";

/* =============================================================================
 * Contribution Catalog
 * =============================================================================
 *
 * Canonical registry governing every Kernel contribution.
 *
 * The catalog owns contribution identity and runtime visibility while delegating
 * persistence concerns to ContributionStore.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • register contributions
 * • validate contribution contracts
 * • resolve contributions
 * • expose runtime visibility
 * • provide immutable inspection APIs
 *
 * Does NOT:
 *
 * • discover contributions
 * • load files
 * • execute lifecycle
 * • initialize infrastructure
 *
 * =============================================================================
 */

export class ContributionCatalog {
  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor(private readonly store: ContributionStore) {}

  public static create(
    store: ContributionStore = ContributionStore.create(),
  ): ContributionCatalog {
    return new ContributionCatalog(store);
  }

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  public register(contribution: KernelContribution): this {
    this.assertContribution(contribution);

    if (this.store.has(contribution.name)) {
      throw new Error(
        `Contribution "${contribution.name}" is already registered.`,
      );
    }

    this.store.set(contribution);

    return this;
  }

  public registerMany(contributions: readonly KernelContribution[]): this {
    for (const contribution of contributions) {
      this.register(contribution);
    }

    return this;
  }

  /* ===========================================================================
   * Resolution
   * ========================================================================= */

  public resolve(name: string): KernelContribution {
    const contribution = this.store.get(name);

    if (!contribution) {
      throw new Error(`Unknown contribution "${name}".`);
    }

    return contribution;
  }

  public has(name: string): boolean {
    return this.store.has(name);
  }

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  public attachRuntime(runtime: ContributionRuntime): void {
    this.store.setRuntime(runtime);
  }

  public runtime(name: string): ContributionRuntime {
    const runtime = this.store.getRuntime(name);

    if (!runtime) {
      throw new Error(`No runtime registered for contribution "${name}".`);
    }

    return runtime;
  }

  /* ===========================================================================
   * Inspection
   * ========================================================================= */

  public all(): readonly KernelContribution[] {
    return this.store.all();
  }

  public runtimes(): readonly ContributionRuntime[] {
    return this.store.allRuntimes();
  }

  public snapshot(): Readonly<{
    size: number;
    contributions: readonly KernelContribution[];
    runtimes: readonly ContributionRuntime[];
  }> {
    return Object.freeze({
      size: this.size,

      contributions: this.all(),

      runtimes: this.runtimes(),
    });
  }

  public get size(): number {
    return this.store.size;
  }

  /* ===========================================================================
   * Maintenance
   * ========================================================================= */

  public unregister(name: string): boolean {
    return this.store.delete(name);
  }

  public clear(): void {
    this.store.clear();
  }

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  private assertContribution(contribution: KernelContribution): void {
    if (!contribution) {
      throw new Error("Cannot register an undefined contribution.");
    }

    if (
      typeof contribution.name !== "string" ||
      contribution.name.length === 0
    ) {
      throw new Error("Contribution must define a valid name.");
    }
  }
}

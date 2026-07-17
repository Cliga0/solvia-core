import type { KernelContribution } from "../contracts/kernel-contribution";
import type { ContributionRuntime } from "../runtime/contribution-runtime";

/* =============================================================================
 * Contribution Store
 * =============================================================================
 *
 * Internal persistence layer for Kernel contributions.
 *
 * The store owns the in-memory representation of registered contributions and
 * their associated runtimes.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • persist contributions
 * • persist contribution runtimes
 * • provide immutable read access
 * • isolate storage implementation
 *
 * Does NOT:
 *
 * • validate contributions
 * • resolve dependencies
 * • execute lifecycle
 * • coordinate bootstrap
 *
 * =============================================================================
 */

export class ContributionStore {
  /* ===========================================================================
   * Construction
   * ========================================================================= */

  private constructor() {}

  public static create(): ContributionStore {
    return new ContributionStore();
  }

  /* ===========================================================================
   * Storage
   * ========================================================================= */

  private readonly contributions = new Map<string, KernelContribution>();

  private readonly runtimes = new Map<string, ContributionRuntime>();

  /* ===========================================================================
   * Contributions
   * ========================================================================= */

  public set(contribution: KernelContribution): void {
    this.contributions.set(contribution.name, contribution);
  }

  public get(name: string): KernelContribution | undefined {
    return this.contributions.get(name);
  }

  public has(name: string): boolean {
    return this.contributions.has(name);
  }

  public delete(name: string): boolean {
    this.runtimes.delete(name);

    return this.contributions.delete(name);
  }

  public all(): readonly KernelContribution[] {
    return Object.freeze([...this.contributions.values()]);
  }

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  public setRuntime(runtime: ContributionRuntime): void {
    this.runtimes.set(runtime.name, runtime);
  }

  public getRuntime(name: string): ContributionRuntime | undefined {
    return this.runtimes.get(name);
  }

  public allRuntimes(): readonly ContributionRuntime[] {
    return Object.freeze([...this.runtimes.values()]);
  }

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  public snapshot(): Readonly<{
    size: number;
    contributions: readonly KernelContribution[];
    runtimes: readonly ContributionRuntime[];
  }> {
    return Object.freeze({
      size: this.size,

      contributions: this.all(),

      runtimes: this.allRuntimes(),
    });
  }

  public get size(): number {
    return this.contributions.size;
  }

  public get runtimeCount(): number {
    return this.runtimes.size;
  }

  /* ===========================================================================
   * Maintenance
   * ========================================================================= */

  public clear(): void {
    this.contributions.clear();
    this.runtimes.clear();
  }
}

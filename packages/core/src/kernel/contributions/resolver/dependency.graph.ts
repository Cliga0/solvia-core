import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Dependency Graph
 * =============================================================================
 *
 * Immutable directed graph describing relationships between Kernel
 * contributions.
 *
 * The graph is the canonical representation consumed by dependency
 * resolution algorithms.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Build dependency nodes
 * • Connect dependency relationships
 * • Provide constant-time lookup
 * • Expose immutable graph traversal
 *
 * Does NOT:
 *
 * • validate dependencies
 * • detect dependency cycles
 * • resolve execution order
 * • execute contributions
 *
 * =============================================================================
 */

export interface DependencyNode {
  /**
   * Contribution represented by this node.
   */
  readonly contribution: KernelContribution;

  /**
   * Required contribution names.
   */
  readonly dependencies: ReadonlySet<string>;

  /**
   * Contributions depending on this node.
   */
  readonly dependents: ReadonlySet<string>;
}

export class DependencyGraph {
  /**
   * Internal lookup table.
   */
  private readonly lookup = new Map<string, DependencyNode>();

  private constructor() {}

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  public static create(
    contributions: readonly KernelContribution[],
  ): DependencyGraph {
    const graph = new DependencyGraph();

    graph.createNodes(contributions);

    graph.connectNodes();

    return graph.freeze();
  }

  /* ===========================================================================
   * Graph Construction
   * ========================================================================= */

  private createNodes(contributions: readonly KernelContribution[]): void {
    for (const contribution of contributions) {
      this.lookup.set(contribution.name, this.createNode(contribution));
    }
  }

  private createNode(contribution: KernelContribution): DependencyNode {
    return {
      contribution,

      dependencies: new Set(contribution.dependencies ?? []),

      dependents: new Set(),
    };
  }

  private connectNodes(): void {
    for (const node of this.lookup.values()) {
      for (const dependency of node.dependencies) {
        const parent = this.lookup.get(dependency);

        if (!parent) {
          continue;
        }

        (parent.dependents as Set<string>).add(node.contribution.name);
      }
    }
  }

  /* ===========================================================================
   * Lookup
   * ========================================================================= */

  public has(name: string): boolean {
    return this.lookup.has(name);
  }

  public get(name: string): DependencyNode | undefined {
    return this.lookup.get(name);
  }

  public contains(contribution: KernelContribution): boolean {
    return this.has(contribution.name);
  }

  /* ===========================================================================
   * Enumeration
   * ========================================================================= */

  public values(): readonly DependencyNode[] {
    return [...this.lookup.values()];
  }

  public contributions(): readonly KernelContribution[] {
    return this.values().map(({ contribution }) => contribution);
  }

  public names(): readonly string[] {
    return [...this.lookup.keys()];
  }

  /* ===========================================================================
   * Properties
   * ========================================================================= */

  public get size(): number {
    return this.lookup.size;
  }

  /* ===========================================================================
   * Finalization
   * ========================================================================= */

  private freeze(): this {
    for (const node of this.lookup.values()) {
      Object.freeze(node.dependencies);

      Object.freeze(node.dependents);

      Object.freeze(node);
    }

    Object.freeze(this.lookup);

    return Object.freeze(this);
  }
}

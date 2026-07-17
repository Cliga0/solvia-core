import type { DependencyGraph } from "./dependency.graph";
import type { KernelContribution } from "../contracts/kernel-contribution";

/* =============================================================================
 * Topological Sorter
 * =============================================================================
 *
 * Resolves deterministic execution order from a Kernel dependency graph.
 *
 * Uses Kahn's topological sorting algorithm.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Produce dependency-safe execution order
 * • Respect dependency constraints
 * • Guarantee deterministic ordering
 *
 * Does NOT:
 *
 * • Validate contribution contracts
 * • Detect dependency validity
 * • Execute lifecycle hooks
 *
 * =============================================================================
 */

export class TopologicalSorter {
  private constructor() {}

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Resolve execution order.
   *
   * Throws if the graph cannot be sorted.
   */
  public static sort(graph: DependencyGraph): readonly KernelContribution[] {
    const nodes = graph.values();

    const indegree = this.createIndegreeMap(graph);

    const queue = this.createInitialQueue(nodes, indegree);

    const result: KernelContribution[] = [];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) {
        break;
      }

      result.push(current);

      const node = graph.get(current.name);

      if (!node) {
        continue;
      }

      for (const dependent of node.dependents) {
        const remaining = (indegree.get(dependent) ?? 0) - 1;

        indegree.set(dependent, remaining);

        if (remaining === 0) {
          const dependency = graph.get(dependent);

          if (dependency) {
            this.insert(queue, dependency.contribution);
          }
        }
      }
    }

    if (result.length !== nodes.length) {
      throw new Error(
        [
          "Unable to resolve Kernel contribution order.",
          "Dependency graph contains unresolved cycles.",
        ].join("\n"),
      );
    }

    return Object.freeze(result);
  }

  /* ===========================================================================
   * Indegree calculation
   * ========================================================================= */

  private static createIndegreeMap(
    graph: DependencyGraph,
  ): Map<string, number> {
    const indegree = new Map<string, number>();

    for (const node of graph.values()) {
      indegree.set(node.contribution.name, node.dependencies.size);
    }

    return indegree;
  }

  /* ===========================================================================
   * Queue initialization
   * ========================================================================= */

  private static createInitialQueue(
    nodes: readonly ReturnType<DependencyGraph["values"]>[number][],
    indegree: Map<string, number>,
  ): KernelContribution[] {
    return nodes
      .filter((node) => indegree.get(node.contribution.name) === 0)
      .map((node) => node.contribution)
      .sort(this.compare);
  }

  /* ===========================================================================
   * Deterministic insertion
   * ========================================================================= */

  private static insert(
    queue: KernelContribution[],
    contribution: KernelContribution,
  ): void {
    queue.push(contribution);

    queue.sort(this.compare);
  }

  /* ===========================================================================
   * Ordering strategy
   * ========================================================================= */

  private static compare(
    left: KernelContribution,
    right: KernelContribution,
  ): number {
    return left.name.localeCompare(right.name);
  }
}

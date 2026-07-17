import { DependencyGraph } from "./dependency.graph";

/* =============================================================================
 * Dependency Cycle Detector
 * =============================================================================
 *
 * Validates that a Kernel contribution dependency graph is acyclic.
 *
 * This component performs graph analysis only.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Traverse dependency graph
 * • Detect circular dependencies
 * • Produce diagnostic dependency chains
 *
 * Does NOT:
 *
 * • mutate graph state
 * • validate missing dependencies
 * • resolve execution order
 * • execute contributions
 *
 * =============================================================================
 */

export class DependencyCycleDetector {
  private constructor() {}

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Assert that the graph contains no dependency cycle.
   *
   * Throws when a circular dependency is found.
   */
  public static assertNoCycles(graph: DependencyGraph): void {
    const visiting = new Set<string>();

    const visited = new Set<string>();

    const path: string[] = [];

    for (const node of graph.values()) {
      this.visit(node.contribution.name, graph, visiting, visited, path);
    }
  }

  /* ===========================================================================
   * Depth First Search
   * ========================================================================= */

  private static visit(
    name: string,
    graph: DependencyGraph,
    visiting: Set<string>,
    visited: Set<string>,
    path: string[],
  ): void {
    if (visited.has(name)) {
      return;
    }

    if (visiting.has(name)) {
      throw this.createCycleError(name, path);
    }

    const node = graph.get(name);

    /**
     * Missing dependencies are handled by another validator.
     */
    if (!node) {
      return;
    }

    visiting.add(name);

    path.push(name);

    for (const dependency of node.dependencies) {
      this.visit(dependency, graph, visiting, visited, path);
    }

    path.pop();

    visiting.delete(name);

    visited.add(name);
  }

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  private static createCycleError(
    name: string,
    path: readonly string[],
  ): Error {
    const index = path.indexOf(name);

    const cycle = [...path.slice(index), name];

    return new Error(
      [
        "Circular Kernel contribution dependency detected.",
        "",
        `Dependency chain: ${cycle.join(" -> ")}`,
      ].join("\n"),
    );
  }
}

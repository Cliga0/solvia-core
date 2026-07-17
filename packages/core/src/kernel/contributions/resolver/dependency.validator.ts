import { DependencyGraph } from "./dependency.graph";

/* =============================================================================
 * Dependency Validator
 * =============================================================================
 *
 * Validates the structural integrity of a Kernel contribution dependency graph.
 *
 * The validator operates on an already built DependencyGraph.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * • Validate contribution identity
 * • Validate dependency references
 * • Validate graph relationships
 * • Guarantee graph consistency before resolution
 *
 * Does NOT:
 *
 * • Build dependency graphs
 * • Resolve execution order
 * • Detect circular dependencies
 * • Execute lifecycle hooks
 *
 * =============================================================================
 */

export abstract class DependencyValidator {
  private constructor() {}

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Validate dependency graph integrity.
   */
  public static validate(graph: DependencyGraph): void {
    this.assertGraph(graph);

    this.validateContributionNames(graph);

    this.validateDependencies(graph);

    this.validateSelfReferences(graph);

    this.validateRelationships(graph);
  }

  /* ===========================================================================
   * Graph validation
   * ========================================================================= */

  private static assertGraph(graph: DependencyGraph): void {
    if (!graph) {
      throw new Error("Dependency graph cannot be undefined.");
    }
  }

  /* ===========================================================================
   * Contribution identity
   * ========================================================================= */

  private static validateContributionNames(graph: DependencyGraph): void {
    for (const node of graph.values()) {
      const name = node.contribution.name?.trim();

      if (!name) {
        throw new Error("Kernel contribution name cannot be empty.");
      }
    }
  }

  /* ===========================================================================
   * Dependency references
   * ========================================================================= */

  private static validateDependencies(graph: DependencyGraph): void {
    for (const node of graph.values()) {
      for (const dependency of node.dependencies) {
        if (!dependency.trim()) {
          throw new Error(
            [
              "Invalid empty dependency.",
              `Contribution: "${node.contribution.name}"`,
            ].join("\n"),
          );
        }

        if (!graph.has(dependency)) {
          throw new Error(
            [
              "Unknown contribution dependency.",
              `Contribution: "${node.contribution.name}"`,
              `Missing dependency: "${dependency}"`,
            ].join("\n"),
          );
        }
      }
    }
  }

  /* ===========================================================================
   * Self dependency
   * ========================================================================= */

  private static validateSelfReferences(graph: DependencyGraph): void {
    for (const node of graph.values()) {
      if (node.dependencies.has(node.contribution.name)) {
        throw new Error(
          [
            "Contribution cannot depend on itself.",
            `Contribution: "${node.contribution.name}"`,
          ].join("\n"),
        );
      }
    }
  }

  /* ===========================================================================
   * Edge consistency
   * ========================================================================= */

  private static validateRelationships(graph: DependencyGraph): void {
    for (const node of graph.values()) {
      for (const dependency of node.dependencies) {
        const dependencyNode = graph.get(dependency);

        if (!dependencyNode?.dependents.has(node.contribution.name)) {
          throw new Error(
            [
              "Broken dependency relationship.",
              `Contribution "${dependency}" does not reference dependent "${node.contribution.name}".`,
            ].join("\n"),
          );
        }
      }
    }
    for (const node of graph.values()) {
      for (const dependent of node.dependents) {
        const dependentNode = graph.get(dependent);

        if (!dependentNode) {
          throw new Error(
            [
              "Invalid dependency graph edge.",
              `Unknown dependent: "${dependent}"`,
            ].join("\n"),
          );
        }

        if (!dependentNode.dependencies.has(node.contribution.name)) {
          throw new Error(
            [
              "Broken dependency relationship.",
              `Contribution "${dependent}" does not declare dependency "${node.contribution.name}".`,
            ].join("\n"),
          );
        }
      }
    }
  }
}

import type { KernelContribution } from "../../contracts/kernel-contribution";

import { DependencyGraph } from "../dependency.graph";
import { DependencyCycleDetector } from "../dependency.cycle-detector";

/* =============================================================================
 * Dependency Cycle Detector Tests
 * =============================================================================
 *
 * Contract tests for circular dependency detection.
 *
 * =============================================================================
 */

describe("DependencyCycleDetector", () => {
  const createContribution = (
    overrides: Partial<KernelContribution> = {},
  ): KernelContribution =>
    ({
      name: "database",

      manifest: {
        version: "1.0.0",
      },

      dependencies: [],

      metadata: {},

      hooks: {},

      ...overrides,
    }) as KernelContribution;

  const createGraph = (contributions: readonly KernelContribution[]) =>
    DependencyGraph.create(contributions);

  /* ===========================================================================
   * Valid graphs
   * ========================================================================= */

  describe("acyclic graphs", () => {
    it("should accept an empty graph", () => {
      const graph = createGraph([]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).not.toThrow();
    });

    it("should accept a single contribution", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).not.toThrow();
    });

    it("should accept linear dependency chains", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "repository",

          dependencies: ["database"],
        }),

        createContribution({
          name: "application",

          dependencies: ["repository"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).not.toThrow();
    });
  });

  /* ===========================================================================
   * Direct cycles
   * ========================================================================= */

  describe("direct cycles", () => {
    it("should detect self dependency cycles", () => {
      const graph = createGraph([
        createContribution({
          name: "database",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).toThrow(
        "Circular Kernel contribution dependency detected.",
      );
    });
  });

  /* ===========================================================================
   * Circular dependencies
   * ========================================================================= */

  describe("circular dependency detection", () => {
    it("should detect two-node cycles", () => {
      const graph = createGraph([
        createContribution({
          name: "database",

          dependencies: ["repository"],
        }),

        createContribution({
          name: "repository",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).toThrow(
        "database -> repository -> database",
      );
    });

    it("should detect three-node cycles", () => {
      const graph = createGraph([
        createContribution({
          name: "a",

          dependencies: ["b"],
        }),

        createContribution({
          name: "b",

          dependencies: ["c"],
        }),

        createContribution({
          name: "c",

          dependencies: ["a"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).toThrow(
        "a -> b -> c -> a",
      );
    });

    it("should detect cycles inside larger graphs", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "cache",

          dependencies: ["database"],
        }),

        createContribution({
          name: "service-a",

          dependencies: ["service-b"],
        }),

        createContribution({
          name: "service-b",

          dependencies: ["service-a"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).toThrow();
    });
  });

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  describe("diagnostics", () => {
    it("should include dependency chain in error message", () => {
      const graph = createGraph([
        createContribution({
          name: "api",

          dependencies: ["database"],
        }),

        createContribution({
          name: "database",

          dependencies: ["api"],
        }),
      ]);

      try {
        DependencyCycleDetector.assertNoCycles(graph);

        fail("Expected cycle detection failure");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);

        expect((error as Error).message).toContain("Dependency chain:");
      }
    });
  });

  /* ===========================================================================
   * Responsibility boundaries
   * ========================================================================= */

  describe("missing dependencies", () => {
    it("should ignore missing dependencies", () => {
      const graph = createGraph([
        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyCycleDetector.assertNoCycles(graph)).not.toThrow();
    });
  });
});

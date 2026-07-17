import type { KernelContribution } from "../../contracts/kernel-contribution";

import { DependencyGraph } from "../dependency.graph";

/* =============================================================================
 * Dependency Graph Tests
 * =============================================================================
 *
 * Contract tests for immutable contribution dependency graph.
 *
 * =============================================================================
 */

describe("DependencyGraph", () => {
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

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("create", () => {
    it("should create graph nodes from contributions", () => {
      const contributions = [
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",
        }),
      ];

      const graph = DependencyGraph.create(contributions);

      expect(graph.size).toBe(2);

      expect(graph.names()).toEqual(["database", "application"]);
    });

    it("should create empty graph from empty collection", () => {
      const graph = DependencyGraph.create([]);

      expect(graph.size).toBe(0);

      expect(graph.values()).toEqual([]);
    });
  });

  /* ===========================================================================
   * Lookup
   * ========================================================================= */

  describe("lookup", () => {
    it("should find existing contribution", () => {
      const database = createContribution({
        name: "database",
      });

      const graph = DependencyGraph.create([database]);

      expect(graph.has("database")).toBe(true);

      expect(graph.get("database")?.contribution).toBe(database);
    });

    it("should return undefined for unknown contribution", () => {
      const graph = DependencyGraph.create([]);

      expect(graph.get("unknown")).toBeUndefined();

      expect(graph.has("unknown")).toBe(false);
    });

    it("should check contribution existence", () => {
      const contribution = createContribution({
        name: "cache",
      });

      const graph = DependencyGraph.create([contribution]);

      expect(graph.contains(contribution)).toBe(true);
    });
  });

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  describe("relationships", () => {
    it("should create dependency relationships", () => {
      const database = createContribution({
        name: "database",
      });

      const application = createContribution({
        name: "application",

        dependencies: ["database"],
      });

      const graph = DependencyGraph.create([database, application]);

      const applicationNode = graph.get("application");

      expect(applicationNode?.dependencies).toEqual(new Set(["database"]));
    });

    it("should create dependent relationships", () => {
      const database = createContribution({
        name: "database",
      });

      const application = createContribution({
        name: "application",

        dependencies: ["database"],
      });

      const graph = DependencyGraph.create([database, application]);

      const databaseNode = graph.get("database");

      expect(databaseNode?.dependents).toEqual(new Set(["application"]));
    });
  });

  /* ===========================================================================
   * Missing dependencies
   * ========================================================================= */

  describe("missing dependency handling", () => {
    it("should ignore missing dependencies because validation is external", () => {
      const application = createContribution({
        name: "application",

        dependencies: ["database"],
      });

      const graph = DependencyGraph.create([application]);

      const node = graph.get("application");

      expect(node?.dependencies).toEqual(new Set(["database"]));

      expect(graph.size).toBe(1);
    });
  });

  /* ===========================================================================
   * Enumeration
   * ========================================================================= */

  describe("enumeration", () => {
    it("should expose graph contributions", () => {
      const contributions = [
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "cache",
        }),
      ];

      const graph = DependencyGraph.create(contributions);

      expect(graph.contributions()).toEqual(contributions);
    });

    it("should expose graph nodes", () => {
      const graph = DependencyGraph.create([createContribution()]);

      expect(graph.values()).toHaveLength(1);
    });
  });

  /* ===========================================================================
   * Immutability
   * ========================================================================= */

  describe("immutability", () => {
    it("should freeze graph instance", () => {
      const graph = DependencyGraph.create([createContribution()]);

      expect(Object.isFrozen(graph)).toBe(true);
    });

    it("should freeze dependency nodes", () => {
      const graph = DependencyGraph.create([createContribution()]);

      const node = graph.get("database");

      expect(Object.isFrozen(node)).toBe(true);
    });

    it("should freeze dependency collections", () => {
      const graph = DependencyGraph.create([createContribution()]);

      const node = graph.get("database");

      expect(Object.isFrozen(node?.dependencies)).toBe(true);

      expect(Object.isFrozen(node?.dependents)).toBe(true);
    });
  });
});

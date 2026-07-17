import type { KernelContribution } from "../../contracts/kernel-contribution";

import { DependencyGraph } from "../dependency.graph";
import { DependencyValidator } from "../dependency.validator";

/* =============================================================================
 * Dependency Validator Tests
 * =============================================================================
 *
 * Contract tests for dependency graph integrity validation.
 *
 * =============================================================================
 */

describe("DependencyValidator", () => {
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
   * Valid graph
   * ========================================================================= */

  describe("validate", () => {
    it("should accept a valid dependency graph", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).not.toThrow();
    });

    it("should reject undefined graph", () => {
      expect(() => DependencyValidator.validate(undefined as never)).toThrow(
        "Dependency graph cannot be undefined.",
      );
    });
  });

  /* ===========================================================================
   * Contribution identity
   * ========================================================================= */

  describe("contribution identity", () => {
    it("should reject empty contribution names", () => {
      const graph = createGraph([
        createContribution({
          name: " ",
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Kernel contribution name cannot be empty.",
      );
    });

    it("should accept trimmed valid names", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).not.toThrow();
    });
  });

  /* ===========================================================================
   * Dependency references
   * ========================================================================= */

  describe("dependency references", () => {
    it("should reject unknown dependencies", () => {
      const graph = createGraph([
        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Unknown contribution dependency.",
      );
    });

    it("should reject empty dependency names", () => {
      const graph = createGraph([
        createContribution({
          name: "application",

          dependencies: [""],
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Invalid empty dependency.",
      );
    });
  });

  /* ===========================================================================
   * Self dependency
   * ========================================================================= */

  describe("self references", () => {
    it("should reject contribution depending on itself", () => {
      const graph = createGraph([
        createContribution({
          name: "database",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Contribution cannot depend on itself.",
      );
    });
  });

  /* ===========================================================================
   * Relationship consistency
   * ========================================================================= */

  describe("graph relationships", () => {
    it("should preserve valid dependency relationships", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      expect(() => DependencyValidator.validate(graph)).not.toThrow();
    });

    it("should reject missing dependent relationship", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      const databaseNode = graph.get("database");

      (databaseNode?.dependents as Set<string>).clear();

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Broken dependency relationship.",
      );
    });

    it("should reject missing dependency declaration", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      const applicationNode = graph.get("application");

      (applicationNode?.dependencies as Set<string>).delete("database");

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Broken dependency relationship.",
      );
    });

    it("should reject orphan dependent references", () => {
      const graph = createGraph([
        createContribution({
          name: "database",
        }),
      ]);

      const databaseNode = graph.get("database");

      (databaseNode?.dependents as Set<string>).add("application");

      expect(() => DependencyValidator.validate(graph)).toThrow(
        "Invalid dependency graph edge.",
      );
    });
  });
});

import type { KernelContribution } from "../../contracts/kernel-contribution";

import { ContributionSorter } from "../contribution.sorter";

/* =============================================================================
 * Contribution Sorter Tests
 * =============================================================================
 *
 * Tests deterministic ordering of resolved contributions.
 *
 * =============================================================================
 */

describe("ContributionSorter", () => {
  const createContribution = (name: string): KernelContribution =>
    ({
      name,

      manifest: {
        version: "1.0.0",
      },

      dependencies: [],

      metadata: {},

      hooks: {},
    }) as KernelContribution;

  /* ===========================================================================
   * Sorting
   * ========================================================================= */

  describe("sort", () => {
    it("should sort contributions alphabetically by name", () => {
      const contributions = [
        createContribution("zeta"),

        createContribution("database"),

        createContribution("application"),
      ];

      const result = ContributionSorter.sort(contributions);

      expect(result.map((contribution) => contribution.name)).toEqual([
        "application",
        "database",
        "zeta",
      ]);
    });

    it("should not mutate original collection", () => {
      const contributions = [
        createContribution("zeta"),

        createContribution("alpha"),
      ];

      ContributionSorter.sort(contributions);

      expect(contributions.map((contribution) => contribution.name)).toEqual([
        "zeta",
        "alpha",
      ]);
    });

    it("should return frozen result", () => {
      const result = ContributionSorter.sort([createContribution("database")]);

      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should handle empty collection", () => {
      const result = ContributionSorter.sort([]);

      expect(result).toEqual([]);

      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should handle already sorted contributions", () => {
      const result = ContributionSorter.sort([
        createContribution("application"),

        createContribution("database"),
      ]);

      expect(result.map((contribution) => contribution.name)).toEqual([
        "application",
        "database",
      ]);
    });
  });

  /* ===========================================================================
   * Determinism
   * ========================================================================= */

  describe("deterministic behavior", () => {
    it("should produce the same order for the same input", () => {
      const contributions = [
        createContribution("cache"),

        createContribution("api"),

        createContribution("database"),
      ];

      const first = ContributionSorter.sort(contributions);

      const second = ContributionSorter.sort(contributions);

      expect(first).toEqual(second);
    });
  });
});

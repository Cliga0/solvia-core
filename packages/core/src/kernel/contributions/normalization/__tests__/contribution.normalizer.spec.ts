import type { ContributionDefinition } from "../../contracts/contribution-definition";

import { ContributionNormalizer } from "../contribution.normalizer";

/* =============================================================================
 * Contribution Normalizer Tests
 * =============================================================================
 *
 * Contract tests for contribution definition normalization.
 *
 * =============================================================================
 */

describe("ContributionNormalizer", () => {
  const createDefinition = (
    overrides: Partial<ContributionDefinition> = {},
  ): ContributionDefinition =>
    ({
      name: " test-contribution ",

      version: "1.0.0",

      type: "module",

      dependencies: [],

      priority: 10,

      lazy: true,

      metadata: {
        environment: "test",
      },

      ...overrides,
    }) as ContributionDefinition;

  /* ===========================================================================
   * Basic normalization
   * ========================================================================= */

  describe("normalize", () => {
    it("should normalize a contribution definition", () => {
      const result = ContributionNormalizer.normalize([createDefinition()]);

      expect(result).toHaveLength(1);

      expect(result[0]).toEqual({
        name: "test-contribution",

        version: "1.0.0",

        type: "module",

        dependencies: [],

        priority: 10,

        lazy: true,

        metadata: {
          environment: "test",
        },
      });
    });

    it("should normalize multiple definitions", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          name: " first ",
        }),

        createDefinition({
          name: " second ",
        }),
      ]);

      expect(result).toHaveLength(2);

      expect(result.map((contribution) => contribution.name)).toEqual([
        "first",
        "second",
      ]);
    });
  });

  /* ===========================================================================
   * Name normalization
   * ========================================================================= */

  describe("name normalization", () => {
    it("should trim contribution names", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          name: "   database   ",
        }),
      ]);

      expect(result[0].name).toBe("database");
    });
  });

  /* ===========================================================================
   * Default values
   * ========================================================================= */

  describe("defaults", () => {
    it("should default priority to zero", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          priority: undefined,
        }),
      ]);

      expect(result[0].priority).toBe(0);
    });

    it("should default lazy to false", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          lazy: undefined,
        }),
      ]);

      expect(result[0].lazy).toBe(false);
    });

    it("should default dependencies to empty array", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          dependencies: undefined,
        }),
      ]);

      expect(result[0].dependencies).toEqual([]);
    });

    it("should default metadata to empty object", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          metadata: undefined,
        }),
      ]);

      expect(result[0].metadata).toEqual({});
    });
  });

  /* ===========================================================================
   * Immutability
   * ========================================================================= */

  describe("immutability", () => {
    it("should freeze normalized collection", () => {
      const result = ContributionNormalizer.normalize([createDefinition()]);

      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should freeze normalized definitions", () => {
      const result = ContributionNormalizer.normalize([createDefinition()]);

      expect(Object.isFrozen(result[0])).toBe(true);
    });

    it("should freeze dependencies collection", () => {
      const result = ContributionNormalizer.normalize([
        createDefinition({
          dependencies: ["database"],
        }),
      ]);

      expect(Object.isFrozen(result[0].dependencies)).toBe(true);
    });

    it("should freeze metadata object", () => {
      const result = ContributionNormalizer.normalize([createDefinition()]);

      expect(Object.isFrozen(result[0].metadata)).toBe(true);
    });
  });

  /* ===========================================================================
   * Isolation
   * ========================================================================= */

  describe("input isolation", () => {
    it("should not mutate original dependencies", () => {
      const dependencies = ["database"];

      const definition = createDefinition({
        dependencies,
      });

      const result = ContributionNormalizer.normalize([definition]);

      expect(result[0].dependencies).not.toBe(dependencies);
    });

    it("should not mutate original metadata", () => {
      const metadata = {
        environment: "test",
      };

      const definition = createDefinition({
        metadata,
      });

      const result = ContributionNormalizer.normalize([definition]);

      expect(result[0].metadata).not.toBe(metadata);
    });
  });
});

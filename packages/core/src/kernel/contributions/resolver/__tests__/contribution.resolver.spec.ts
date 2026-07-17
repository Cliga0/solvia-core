import type { BootstrapContext } from "../../../bootstrap/contracts/bootstrap-context";

import type { KernelContribution } from "../../contracts/kernel-contribution";
import type { ContributionDefinition } from "../../contracts/contribution-definition";

import { ContributionResolver } from "../contribution.resolver";

import { ContributionSourceResolver } from "../contribution.source-resolver";
import { ContributionNormalizer } from "../../normalization/contribution.normalizer";
import { ContributionFactory } from "../../factory/contribution.factory";
import { ContributionValidator } from "../../validator/contribution.validator";

import { DependencyGraph } from "../dependency.graph";
import { DependencyValidator } from "../dependency.validator";
import { DependencyCycleDetector } from "../dependency.cycle-detector";
import { TopologicalSorter } from "../topological-sorter";
import { ContributionSorter } from "../contribution.sorter";

/* =============================================================================
 * Contribution Resolver Tests
 * =============================================================================
 *
 * Contract tests for the Kernel contribution resolution pipeline.
 *
 * =============================================================================
 */

describe("ContributionResolver", () => {
  const createBootstrapContext = (): BootstrapContext =>
    ({
      environment: "test",
    }) as BootstrapContext;

  const createDefinition = (
    overrides: Partial<ContributionDefinition> = {},
  ): ContributionDefinition =>
    ({
      name: "database",

      type: "module",

      dependencies: [],

      priority: 0,

      lazy: false,

      metadata: {},

      ...overrides,
    }) as ContributionDefinition;

  const createContribution = (
    overrides: Partial<KernelContribution> = {},
  ): KernelContribution => ({
    name: "database",

    manifest: {
      metadata: {
        source: "test",
      },
    },

    dependencies: [],

    metadata: {},

    hooks: {},

    ...overrides,
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  /* ===========================================================================
   * Pipeline orchestration
   * ========================================================================= */

  describe("resolution pipeline", () => {
    it("should execute the complete contribution resolution pipeline", () => {
      const definitions = [createDefinition()];

      const contributions = [createContribution()];

      jest
        .spyOn(ContributionSourceResolver, "resolve")
        .mockReturnValue(definitions);

      jest
        .spyOn(ContributionNormalizer, "normalize")
        .mockReturnValue(definitions);

      jest
        .spyOn(ContributionFactory, "createMany")
        .mockReturnValue(contributions);

      const validateSpy = jest
        .spyOn(ContributionValidator, "validateMany")
        .mockImplementation(() => {});

      const graphSpy = jest
        .spyOn(DependencyGraph, "create")
        .mockReturnValue(DependencyGraph.create(contributions));

      jest.spyOn(DependencyValidator, "validate").mockImplementation(() => {});

      jest
        .spyOn(DependencyCycleDetector, "assertNoCycles")
        .mockImplementation(() => {});

      jest.spyOn(TopologicalSorter, "sort").mockReturnValue(contributions);

      jest.spyOn(ContributionSorter, "sort").mockReturnValue(contributions);

      const result = ContributionResolver.resolve(createBootstrapContext());

      expect(result).toEqual(contributions);

      expect(validateSpy).toHaveBeenCalledTimes(1);

      expect(graphSpy).toHaveBeenCalled();
    });
  });

  /* ===========================================================================
   * Immutability
   * ========================================================================= */

  describe("immutability", () => {
    it("should return frozen contribution collection", () => {
      jest
        .spyOn(ContributionSourceResolver, "resolve")
        .mockReturnValue([createDefinition()]);

      jest
        .spyOn(ContributionNormalizer, "normalize")
        .mockReturnValue([createDefinition()]);

      jest
        .spyOn(ContributionFactory, "createMany")
        .mockReturnValue([createContribution()]);

      const result = ContributionResolver.resolve(createBootstrapContext());

      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  /* ===========================================================================
   * Discovery failures
   * ========================================================================= */

  describe("failure handling", () => {
    it("should propagate discovery errors", () => {
      jest
        .spyOn(ContributionSourceResolver, "resolve")
        .mockImplementation(() => {
          throw new Error("discovery failed");
        });

      expect(() =>
        ContributionResolver.resolve(createBootstrapContext()),
      ).toThrow("discovery failed");
    });

    it("should propagate validation errors", () => {
      jest
        .spyOn(ContributionSourceResolver, "resolve")
        .mockReturnValue([createDefinition()]);

      jest
        .spyOn(ContributionNormalizer, "normalize")
        .mockReturnValue([createDefinition()]);

      jest
        .spyOn(ContributionFactory, "createMany")
        .mockReturnValue([createContribution()]);

      jest
        .spyOn(ContributionValidator, "validateMany")
        .mockImplementation(() => {
          throw new Error("invalid contribution");
        });

      expect(() =>
        ContributionResolver.resolve(createBootstrapContext()),
      ).toThrow("invalid contribution");
    });
  });

  /* ===========================================================================
   * Dependency ordering
   * ========================================================================= */

  describe("dependency resolution", () => {
    it("should preserve dependency-safe ordering", () => {
      const database = createContribution({
        name: "database",
      });

      const api = createContribution({
        name: "api",

        dependencies: ["database"],
      });

      jest.spyOn(ContributionSourceResolver, "resolve").mockReturnValue([]);

      jest.spyOn(ContributionNormalizer, "normalize").mockReturnValue([]);

      jest
        .spyOn(ContributionFactory, "createMany")
        .mockReturnValue([api, database]);

      jest.spyOn(TopologicalSorter, "sort").mockReturnValue([database, api]);

      jest.spyOn(ContributionSorter, "sort").mockReturnValue([database, api]);

      const result = ContributionResolver.resolve(createBootstrapContext());

      expect(result.map((c) => c.name)).toEqual(["database", "api"]);
    });
  });
});

import { ContributionCatalog } from "../contribution.catalog";
import { ContributionStore } from "../contribution.store";

import type { KernelContribution } from "../../contracts/kernel-contribution";
import type { ContributionRuntime } from "../../runtime/contribution-runtime";

/* =============================================================================
 * Contribution Catalog Tests
 * =============================================================================
 *
 * Contract tests for the Kernel contribution governance layer.
 *
 * These tests verify:
 *
 * • contribution registration rules
 * • contribution resolution
 * • runtime visibility
 * • immutable inspection
 * • lifecycle cleanup
 *
 * =============================================================================
 */

describe("ContributionCatalog", () => {
  let catalog: ContributionCatalog;

  beforeEach(() => {
    catalog = ContributionCatalog.create();
  });

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("creation", () => {
    it("should create an empty catalog", () => {
      expect(catalog.size).toBe(0);
    });

    it("should create catalog with custom store", () => {
      const store = ContributionStore.create();

      const customCatalog = ContributionCatalog.create(store);

      expect(customCatalog.size).toBe(0);
    });
  });

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  describe("registration", () => {
    it("should register a contribution", () => {
      const contribution: KernelContribution = {
        name: "database",
      } as KernelContribution;

      catalog.register(contribution);

      expect(catalog.size).toBe(1);

      expect(catalog.has("database")).toBe(true);
    });

    it("should return catalog instance after registration", () => {
      const result = catalog.register({
        name: "cache",
      } as KernelContribution);

      expect(result).toBe(catalog);
    });

    it("should register multiple contributions", () => {
      catalog.registerMany([
        {
          name: "database",
        } as KernelContribution,

        {
          name: "cache",
        } as KernelContribution,
      ]);

      expect(catalog.size).toBe(2);
    });

    it("should reject duplicate contribution registration", () => {
      const contribution = {
        name: "database",
      } as KernelContribution;

      catalog.register(contribution);

      expect(() => catalog.register(contribution)).toThrow(
        'Contribution "database" is already registered.',
      );
    });
  });

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  describe("validation", () => {
    it("should reject undefined contribution", () => {
      expect(() =>
        catalog.register(undefined as unknown as KernelContribution),
      ).toThrow("Cannot register an undefined contribution.");
    });

    it("should reject contribution without name", () => {
      expect(() => catalog.register({} as KernelContribution)).toThrow(
        "Contribution must define a valid name.",
      );
    });

    it("should reject empty contribution name", () => {
      expect(() =>
        catalog.register({
          name: "",
        } as KernelContribution),
      ).toThrow("Contribution must define a valid name.");
    });
  });

  /* ===========================================================================
   * Resolution
   * ========================================================================= */

  describe("resolution", () => {
    it("should resolve registered contribution", () => {
      const contribution = {
        name: "api",
      } as KernelContribution;

      catalog.register(contribution);

      expect(catalog.resolve("api")).toBe(contribution);
    });

    it("should throw when resolving unknown contribution", () => {
      expect(() => catalog.resolve("unknown")).toThrow(
        'Unknown contribution "unknown".',
      );
    });
  });

  /* ===========================================================================
   * Runtime
   * ========================================================================= */

  describe("runtime", () => {
    it("should attach contribution runtime", () => {
      const runtime = {
        name: "database",
      } as ContributionRuntime;

      catalog.attachRuntime(runtime);

      expect(catalog.runtime("database")).toBe(runtime);
    });

    it("should throw when runtime does not exist", () => {
      expect(() => catalog.runtime("missing")).toThrow(
        'No runtime registered for contribution "missing".',
      );
    });
  });

  /* ===========================================================================
   * Inspection
   * ========================================================================= */

  describe("inspection", () => {
    it("should return all contributions", () => {
      catalog.register({
        name: "worker",
      } as KernelContribution);

      expect(catalog.all()).toHaveLength(1);
    });

    it("should return all runtimes", () => {
      catalog.attachRuntime({
        name: "worker",
      } as ContributionRuntime);

      expect(catalog.runtimes()).toHaveLength(1);
    });

    it("should return immutable snapshot", () => {
      catalog.register({
        name: "api",
      } as KernelContribution);

      const snapshot = catalog.snapshot();

      expect(snapshot.size).toBe(1);

      expect(Object.isFrozen(snapshot)).toBe(true);
    });
  });

  /* ===========================================================================
   * Maintenance
   * ========================================================================= */

  describe("maintenance", () => {
    it("should unregister contribution", () => {
      catalog.register({
        name: "worker",
      } as KernelContribution);

      expect(catalog.unregister("worker")).toBe(true);

      expect(catalog.has("worker")).toBe(false);
    });

    it("should return false when unregistering unknown contribution", () => {
      expect(catalog.unregister("missing")).toBe(false);
    });

    it("should clear catalog", () => {
      catalog.register({
        name: "database",
      } as KernelContribution);

      catalog.attachRuntime({
        name: "database",
      } as ContributionRuntime);

      catalog.clear();

      expect(catalog.size).toBe(0);

      expect(catalog.all()).toHaveLength(0);

      expect(catalog.runtimes()).toHaveLength(0);
    });
  });
});

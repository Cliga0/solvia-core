import { ContributionStore } from "../contribution.store";

import type { KernelContribution } from "../../contracts/kernel-contribution";
import type { ContributionRuntime } from "../../runtime/contribution-runtime";

/* =============================================================================
 * Contribution Store Tests
 * =============================================================================
 *
 * Contract tests for the Kernel contribution persistence layer.
 *
 * These tests verify:
 *
 * • storage behavior
 * • runtime association
 * • immutable inspection
 * • lifecycle cleanup
 *
 * =============================================================================
 */

describe("ContributionStore", () => {
  let store: ContributionStore;

  beforeEach(() => {
    store = ContributionStore.create();
  });

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("creation", () => {
    it("should create an empty store", () => {
      expect(store.size).toBe(0);

      expect(store.runtimeCount).toBe(0);
    });
  });

  /* ===========================================================================
   * Contribution persistence
   * ========================================================================= */

  describe("contribution storage", () => {
    it("should store a contribution", () => {
      const contribution: KernelContribution = {
        name: "database",
      } as KernelContribution;

      store.set(contribution);

      expect(store.size).toBe(1);

      expect(store.get("database")).toBe(contribution);
    });

    it("should detect existing contribution", () => {
      const contribution: KernelContribution = {
        name: "cache",
      } as KernelContribution;

      store.set(contribution);

      expect(store.has("cache")).toBe(true);

      expect(store.has("missing")).toBe(false);
    });

    it("should return undefined for unknown contribution", () => {
      expect(store.get("unknown")).toBeUndefined();
    });
  });

  /* ===========================================================================
   * Runtime persistence
   * ========================================================================= */

  describe("runtime storage", () => {
    it("should store contribution runtime", () => {
      const runtime: ContributionRuntime = {
        name: "database",
      } as ContributionRuntime;

      store.setRuntime(runtime);

      expect(store.runtimeCount).toBe(1);

      expect(store.getRuntime("database")).toBe(runtime);
    });

    it("should return undefined for unknown runtime", () => {
      expect(store.getRuntime("missing")).toBeUndefined();
    });
  });

  /* ===========================================================================
   * Collection access
   * ========================================================================= */

  describe("collection access", () => {
    it("should return all contributions", () => {
      const first: KernelContribution = {
        name: "first",
      } as KernelContribution;

      const second: KernelContribution = {
        name: "second",
      } as KernelContribution;

      store.set(first);

      store.set(second);

      const result = store.all();

      expect(result).toHaveLength(2);

      expect(result).toContain(first);

      expect(result).toContain(second);
    });

    it("should expose immutable contribution collections", () => {
      const contribution: KernelContribution = {
        name: "immutable",
      } as KernelContribution;

      store.set(contribution);

      const result = store.all();

      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should expose immutable runtime collections", () => {
      const runtime: ContributionRuntime = {
        name: "runtime",
      } as ContributionRuntime;

      store.setRuntime(runtime);

      const result = store.allRuntimes();

      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  /* ===========================================================================
   * Deletion
   * ========================================================================= */

  describe("deletion", () => {
    it("should remove contribution", () => {
      store.set({
        name: "worker",
      } as KernelContribution);

      expect(store.delete("worker")).toBe(true);

      expect(store.has("worker")).toBe(false);

      expect(store.size).toBe(0);
    });

    it("should remove associated runtime when deleting contribution", () => {
      store.set({
        name: "worker",
      } as KernelContribution);

      store.setRuntime({
        name: "worker",
      } as ContributionRuntime);

      store.delete("worker");

      expect(store.getRuntime("worker")).toBeUndefined();

      expect(store.runtimeCount).toBe(0);
    });

    it("should return false when deleting unknown contribution", () => {
      expect(store.delete("missing")).toBe(false);
    });
  });

  /* ===========================================================================
   * Snapshot
   * ========================================================================= */

  describe("snapshot", () => {
    it("should create immutable snapshot", () => {
      store.set({
        name: "api",
      } as KernelContribution);

      const snapshot = store.snapshot();

      expect(snapshot.size).toBe(1);

      expect(snapshot.contributions).toHaveLength(1);

      expect(Object.isFrozen(snapshot)).toBe(true);
    });
  });

  /* ===========================================================================
   * Maintenance
   * ========================================================================= */

  describe("clear", () => {
    it("should clear all stored data", () => {
      store.set({
        name: "service",
      } as KernelContribution);

      store.setRuntime({
        name: "service",
      } as ContributionRuntime);

      store.clear();

      expect(store.size).toBe(0);

      expect(store.runtimeCount).toBe(0);
    });
  });
});

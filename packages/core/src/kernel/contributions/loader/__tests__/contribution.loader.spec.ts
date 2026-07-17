import type { BootstrapContext } from "../../../bootstrap/contracts/bootstrap-context";
import type { KernelContribution } from "../../contracts/kernel-contribution";

import { ContributionLoader } from "../contribution.loader";
import { ContributionCatalog } from "../../registry/contribution.catalog";
import { BootstrapProfile } from "../../../bootstrap/enums/bootstrap-profile.enum";

/* =============================================================================
 * Contribution Loader Tests
 * =============================================================================
 *
 * Contract tests for contribution loading orchestration.
 *
 * =============================================================================
 */

describe("ContributionLoader", () => {
  const createBootstrapContext = (
    overrides: Partial<BootstrapContext> = {},
  ): BootstrapContext =>
    ({
      id: "bootstrap",

      startedAt: new Date(),

      profile: BootstrapProfile.TESTING,

      features: new Set(),

      options: {},

      environment: "test",

      rootDirectory: process.cwd(),

      version: "1.0.0",

      nodeVersion: process.version,

      architecture: process.arch,

      phases: [],

      isReady: false,

      hasFailed: false,

      elapsedTime: 0,

      metadata: {},

      ...overrides,
    }) as BootstrapContext;

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

  const createLoader = () =>
    new ContributionLoader(
      createBootstrapContext(),
      ContributionCatalog.create(),
    );

  /* ===========================================================================
   * Creation
   * ========================================================================= */

  describe("creation", () => {
    it("should create contribution loader", () => {
      expect(createLoader()).toBeInstanceOf(ContributionLoader);
    });
  });

  /* ===========================================================================
   * Loading
   * ========================================================================= */

  describe("loading", () => {
    it("should load a single contribution", async () => {
      const loader = createLoader();

      const runtime = await loader.load([createContribution()]);

      expect(runtime.count).toBe(1);

      expect(runtime.has("database")).toBe(true);

      expect(runtime.runtime("database")).toBeDefined();
    });

    it("should load multiple contributions", async () => {
      const loader = createLoader();

      const runtime = await loader.load([
        createContribution({
          name: "database",
        }),

        createContribution({
          name: "application",

          dependencies: ["database"],
        }),
      ]);

      expect(runtime.count).toBe(2);

      expect(runtime.has("database")).toBe(true);

      expect(runtime.has("application")).toBe(true);
    });

    it("should expose loaded manifests", async () => {
      const loader = createLoader();

      const runtime = await loader.load([createContribution()]);

      expect(runtime.manifests()).toHaveLength(1);
    });

    it("should return immutable manager runtime snapshot", async () => {
      const loader = createLoader();

      const runtime = await loader.load([createContribution()]);

      expect(Object.isFrozen(runtime.snapshot())).toBe(true);
    });
  });

  /* ===========================================================================
   * Lifecycle orchestration
   * ========================================================================= */

  describe("lifecycle", () => {
    it("should execute lifecycle hooks in order", async () => {
      const calls: string[] = [];

      const contribution = createContribution({
        hooks: {
          beforeLoad: async () => void calls.push("beforeLoad"),

          load: async () => void calls.push("load"),

          afterLoad: async () => void calls.push("afterLoad"),

          beforeStart: async () => void calls.push("beforeStart"),

          start: async () => void calls.push("start"),

          ready: async () => void calls.push("ready"),
        },
      });

      await createLoader().load([contribution]);

      expect(calls).toEqual([
        "beforeLoad",
        "load",
        "afterLoad",
        "beforeStart",
        "start",
        "ready",
      ]);
    });

    it("should support contributions without lifecycle hooks", async () => {
      await expect(
        createLoader().load([
          createContribution({
            hooks: {},
          }),
        ]),
      ).resolves.toBeDefined();
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("failure handling", () => {
    it("should propagate load failures", async () => {
      const error = new Error("load failed");

      await expect(
        createLoader().load([
          createContribution({
            hooks: {
              load: async () => {
                throw error;
              },
            },
          }),
        ]),
      ).rejects.toThrow(error);
    });

    it("should propagate start failures", async () => {
      const error = new Error("start failed");

      await expect(
        createLoader().load([
          createContribution({
            hooks: {
              start: async () => {
                throw error;
              },
            },
          }),
        ]),
      ).rejects.toThrow(error);
    });
  });
});

import { ContributionLifecycle } from "../contribution.lifecycle";

import type { ContributionContext } from "../../contracts/contribution-context";
import type { ContributionRuntime } from "../../runtime/contribution-runtime";
import type { KernelContribution } from "../../contracts/kernel-contribution";

/* =============================================================================
 * Contribution Lifecycle Tests
 * =============================================================================
 *
 * Contract tests for single contribution lifecycle orchestration.
 *
 * =============================================================================
 */

describe("ContributionLifecycle", () => {
  const createContext = (): ContributionContext =>
    ({
      environment: "test",
    }) as ContributionContext;

  const createRuntime = (): ContributionRuntime =>
    ({
      name: "test-runtime",
    }) as ContributionRuntime;

  const createContribution = (
    overrides: Partial<KernelContribution> = {},
  ): KernelContribution => ({
    name: "test-contribution",

    manifest: {},

    dependencies: [],

    metadata: {},

    hooks: {},

    ...overrides,
  });

  const createLifecycle = (
    contribution: KernelContribution = createContribution(),
  ): ContributionLifecycle =>
    ContributionLifecycle.create(contribution, createContext());

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  describe("create", () => {
    it("should create lifecycle instance", () => {
      expect(createLifecycle()).toBeInstanceOf(ContributionLifecycle);
    });
  });

  /* ===========================================================================
   * Load
   * ========================================================================= */

  describe("load", () => {
    it("should execute load lifecycle hooks in order", async () => {
      const events: string[] = [];

      const contribution = createContribution({
        hooks: {
          beforeLoad: async () => {
            events.push("beforeLoad");
          },

          load: async () => {
            events.push("load");
          },

          afterLoad: async () => {
            events.push("afterLoad");
          },
        },
      });

      await createLifecycle(contribution).load();

      expect(events).toEqual(["beforeLoad", "load", "afterLoad"]);
    });

    it("should support contribution without hooks", async () => {
      await expect(createLifecycle().load()).resolves.not.toThrow();
    });

    it("should notify error hook when load fails", async () => {
      const error = new Error("load failed");

      const errorHook = jest.fn();

      const contribution = createContribution({
        hooks: {
          load: async () => {
            throw error;
          },

          error: errorHook,
        },
      });

      await expect(createLifecycle(contribution).load()).rejects.toThrow(
        "load failed",
      );

      expect(errorHook).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });

  /* ===========================================================================
   * Start
   * ========================================================================= */

  describe("start", () => {
    it("should execute start lifecycle hooks", async () => {
      const runtime = createRuntime();

      const events: string[] = [];

      const contribution = createContribution({
        hooks: {
          beforeStart: async () => {
            events.push("beforeStart");
          },

          start: async () => {
            events.push("start");
          },
        },
      });

      const lifecycle = createLifecycle(contribution);

      await lifecycle.load();

      await lifecycle.start(runtime);

      expect(events).toEqual(["beforeStart", "start"]);
    });

    it("should rollback when start fails", async () => {
      const runtime = createRuntime();

      const events: string[] = [];

      const contribution = createContribution({
        hooks: {
          start: async () => {
            events.push("start");

            throw new Error("startup failed");
          },

          stop: async () => {
            events.push("stop");
          },
        },
      });

      const lifecycle = createLifecycle(contribution);

      await lifecycle.load();

      await expect(lifecycle.start(runtime)).rejects.toThrow("startup failed");

      expect(events).toEqual(["start"]);
    });
  });

  /* ===========================================================================
   * Ready
   * ========================================================================= */

  describe("ready", () => {
    it("should execute ready only after start", async () => {
      const runtime = createRuntime();

      const ready = jest.fn();

      const contribution = createContribution({
        hooks: {
          start: jest.fn(),

          ready,
        },
      });

      const lifecycle = createLifecycle(contribution);

      await lifecycle.load();

      await lifecycle.start(runtime);

      await lifecycle.ready(runtime);

      expect(ready).toHaveBeenCalledWith(runtime);
    });

    it("should ignore ready before start", async () => {
      const runtime = createRuntime();

      const ready = jest.fn();

      const contribution = createContribution({
        hooks: {
          ready,
        },
      });

      await createLifecycle(contribution).ready(runtime);

      expect(ready).not.toHaveBeenCalled();
    });
  });

  /* ===========================================================================
   * Stop
   * ========================================================================= */

  describe("stop", () => {
    it("should execute stop after start", async () => {
      const runtime = createRuntime();

      const stop = jest.fn();

      const contribution = createContribution({
        hooks: {
          start: jest.fn(),

          stop,
        },
      });

      const lifecycle = createLifecycle(contribution);

      await lifecycle.load();

      await lifecycle.start(runtime);

      await lifecycle.stop(runtime);

      expect(stop).toHaveBeenCalledWith(runtime);
    });
  });

  /* ===========================================================================
   * Destroy
   * ========================================================================= */

  describe("destroy", () => {
    it("should destroy after load", async () => {
      const destroy = jest.fn();

      const contribution = createContribution({
        hooks: {
          load: jest.fn(),

          destroy,
        },
      });

      const lifecycle = createLifecycle(contribution);

      await lifecycle.load();

      await lifecycle.destroy();

      expect(destroy).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  /* ===========================================================================
   * Error isolation
   * ========================================================================= */

  describe("error handling", () => {
    it("should ignore failing error hooks", async () => {
      const contribution = createContribution({
        hooks: {
          load: async () => {
            throw new Error("failure");
          },

          error: async () => {
            throw new Error("error hook failure");
          },
        },
      });

      await expect(createLifecycle(contribution).load()).rejects.toThrow(
        "failure",
      );
    });
  });
});

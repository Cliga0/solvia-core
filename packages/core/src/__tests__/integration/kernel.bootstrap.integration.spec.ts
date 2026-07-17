import { BootstrapLoader } from "../../kernel/bootstrap/bootstrap.loader";

import type { BootstrapRuntime } from "../../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import { BootstrapProfile } from "../../kernel/bootstrap/enums/bootstrap-profile.enum";

/* =============================================================================
 * Kernel Bootstrap Integration
 * =============================================================================
 *
 * High level integration specification validating the public Kernel bootstrap
 * contract.
 *
 * This suite intentionally tests the observable runtime behavior and lifecycle
 * invariants exposed by BootstrapLoader.
 *
 *
 * Validates:
 *
 *  Runtime boundary
 *  Lifecycle completion
 *  Runtime consistency
 *  Subsystem availability
 *  Runtime isolation
 *  Failure propagation
 *
 *
 * Does NOT validate:
 *
 *  Internal bootstrap actions
 *  Pipeline implementation
 *  Private services
 *  Concrete adapters
 *
 * =============================================================================
 */

describe("Kernel Bootstrap Integration", () => {
  let runtime: BootstrapRuntime;

  beforeAll(async () => {
    runtime = await BootstrapLoader.load({
      profile: BootstrapProfile.TESTING,
    });
  });

  describe("runtime boundary", () => {
    it("should expose an immutable runtime contract", () => {
      expect(runtime).toBeDefined();

      expect(runtime.id).toEqual(expect.any(String));

      expect(runtime.startedAt).toBeInstanceOf(Date);

      expect(Object.isFrozen(runtime)).toBe(true);
    });

    it("should expose an immutable feature collection", () => {
      expect(Array.isArray(runtime.features)).toBe(true);

      expect(Object.isFrozen(runtime.features)).toBe(true);

      expect(runtime.features).toHaveLength(0);
    });
  });

  describe("bootstrap lifecycle", () => {
    it("should complete bootstrap successfully", () => {
      expect(runtime.context.isReady).toBe(true);
    });

    it("should expose completed lifecycle metadata", () => {
      expect(runtime.context.completedAt).toBeInstanceOf(Date);

      expect(runtime.context.completedAt!.getTime()).toBeGreaterThanOrEqual(
        runtime.startedAt.getTime(),
      );
    });

    it("should expose executed phases", () => {
      expect(runtime.phases).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "initialize",
          }),

          expect.objectContaining({
            name: "registry",
          }),
        ]),
      );
    });
  });
  describe("runtime identity", () => {
    it("should preserve bootstrap configuration", () => {
      expect(runtime.profile).toBe(BootstrapProfile.TESTING);
    });

    it("should expose environment information", () => {
      expect(runtime.environment).toEqual(expect.any(String));

      expect(runtime.version).toEqual(expect.any(String));
    });

    it("should expose execution identity", () => {
      expect(runtime.id).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  describe("kernel subsystems", () => {
    it("should initialize contribution subsystem", () => {
      expect(runtime.contributions).toBeDefined();

      expect(runtime.contributions.runtime).toBeDefined();
    });

    it("should produce discovery artifacts", () => {
      expect(runtime.discovery).toBeDefined();

      expect(runtime.discovery.modules).toBeDefined();

      expect(runtime.discovery.providers).toBeDefined();
    });

    it("should produce registry snapshot", () => {
      expect(runtime.registry).toBeDefined();

      expect(runtime.registry.providers).toBeDefined();
    });
  });

  describe("runtime isolation", () => {
    it("should create isolated kernel instances", async () => {
      const first = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      const second = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      expect(first).not.toBe(second);

      expect(first.id).not.toBe(second.id);

      expect(first.context).not.toBe(second.context);
    });
  });

  describe("failure contract", () => {
    it("should reject unsupported bootstrap configuration", async () => {
      await expect(
        BootstrapLoader.load({
          profile: "invalid-profile" as never,
        }),
      ).rejects.toThrow();
    });
  });
});

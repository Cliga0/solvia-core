import { InstrumentationRuntimeBuilder } from "../instrumentation-runtime.builder";
import { InstrumentationRuntimeContext } from "../instrumentation-runtime.context";

import type { InstrumentationProvider } from "../../contracts/instrumentation-provider";

describe("InstrumentationRuntimeBuilder", () => {
  const createProvider = (name = "test-provider"): InstrumentationProvider => ({
    name,

    supports: jest.fn(() => true),

    initialize: jest.fn(async () => undefined),

    shutdown: jest.fn(async () => undefined),
  });

  const createContext = () =>
    InstrumentationRuntimeContext.create({
      environment: "test",

      debug: true,

      attributes: {
        "service.name": "solvia-test",
      },
    });

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("build()", () => {
    it("should build a valid immutable instrumentation runtime", () => {
      const context = createContext();

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.id).toBeDefined();

      expect(runtime.startedAt).toBeInstanceOf(Date);

      expect(runtime.environment).toBe("test");

      expect(runtime.debug).toBe(true);

      expect(runtime.healthy).toBe(true);

      expect(Object.isFrozen(runtime)).toBe(true);
    });
  });

  /* ===========================================================================
   * Provider snapshot
   * ========================================================================= */

  describe("providers", () => {
    it("should expose initialized providers", () => {
      const context = createContext();

      const provider = createProvider();

      context.registerProvider(provider);

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.providers).toHaveLength(1);

      expect(runtime.providers[0]).toBe(provider);
    });

    it("should freeze provider collection", () => {
      const context = createContext();

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(Object.isFrozen(runtime.providers)).toBe(true);
    });
  });

  /* ===========================================================================
   * Health computation
   * ========================================================================= */

  describe("health", () => {
    it("should report healthy runtime when no failures exist", () => {
      const context = createContext();

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.healthy).toBe(true);
    });

    it("should report unhealthy runtime when provider fails", () => {
      const context = createContext();

      const provider = createProvider();

      const error = new Error("provider failed");

      context.markFailed(provider, error);

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.healthy).toBe(false);

      expect(runtime.errors.get(provider)).toBe(error);
    });
  });

  /* ===========================================================================
   * Runtime summary
   * ========================================================================= */

  describe("summary", () => {
    it("should expose provider execution metrics", () => {
      const context = createContext();

      context.registerProvider(createProvider("otel"));

      context.registerProvider(createProvider("prometheus"));

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.summary).toEqual({
        providerCount: 2,

        enabledProviders: 2,

        failedProviders: 0,
      });
    });
  });

  /* ===========================================================================
   * Diagnostics
   * ========================================================================= */

  describe("diagnostics", () => {
    it("should expose failures as provider references", () => {
      const context = createContext();

      const provider = createProvider();

      context.markFailed(provider, new Error("boom"));

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.diagnostics.failures).toContain(provider);
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata", () => {
    it("should preserve metadata snapshot", () => {
      const context = createContext();

      context.setMetadata("region", "eu-west");

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.metadata.get("region")).toBe("eu-west");
    });
  });

  /* ===========================================================================
   * Duration
   * ========================================================================= */

  describe("duration", () => {
    it("should compute runtime duration", () => {
      const context = createContext();

      const runtime = InstrumentationRuntimeBuilder.create(context).build();

      expect(runtime.duration).toBeGreaterThanOrEqual(0);
    });
  });

  /* ===========================================================================
   * Validation
   * ========================================================================= */

  describe("validation", () => {
    it("should reject invalid context", () => {
      const context = createContext();

      Object.defineProperty(context, "id", {
        value: "",
      });

      expect(() =>
        InstrumentationRuntimeBuilder.create(context).build(),
      ).toThrow("Runtime identifier is missing");
    });
  });
});

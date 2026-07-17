import { InstrumentationEngine } from "../instrumentation.engine";

import { InstrumentationRuntimeBuilder } from "../runtime/instrumentation-runtime.builder";

import type { InstrumentationProvider } from "../contracts/instrumentation-provider";

import type { InstrumentationOptions } from "../contracts/instrumentation-options";

import type { InstrumentationRuntime } from "../contracts/instrumentation-runtime";

/* =============================================================================
 * Instrumentation Engine Tests
 * =============================================================================
 *
 * Contract tests for instrumentation orchestration lifecycle.
 *
 * =============================================================================
 */

jest.mock("../runtime/instrumentation-runtime.builder");

describe("InstrumentationEngine", () => {
  /* ===========================================================================
   * Fixtures
   * ========================================================================= */

  const createOptions = (): InstrumentationOptions =>
    ({
      environment: "test",
    }) as InstrumentationOptions;

  const createProvider = (
    name = "test-provider",
  ): InstrumentationProvider & {
    initialize: jest.Mock;
    shutdown: jest.Mock;
    supports: jest.Mock;
  } => ({
    name,

    supports: jest.fn().mockReturnValue(true),

    initialize: jest.fn().mockResolvedValue(undefined),

    shutdown: jest.fn().mockResolvedValue(undefined),
  });

  const createRuntime = (): InstrumentationRuntime =>
    ({
      id: "runtime-test",
    }) as InstrumentationRuntime;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(InstrumentationRuntimeBuilder, "create").mockReturnValue({
      build: jest.fn().mockReturnValue(createRuntime()),
    } as never);
  });

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  describe("create", () => {
    it("should create an instrumentation engine instance", () => {
      const engine = InstrumentationEngine.create();

      expect(engine).toBeInstanceOf(InstrumentationEngine);
    });
  });

  /* ===========================================================================
   * Initialization
   * ========================================================================= */

  describe("initialize", () => {
    it("should initialize all providers sequentially", async () => {
      const first = createProvider("first");

      const second = createProvider("second");

      const engine = InstrumentationEngine.create(createOptions(), [
        first,
        second,
      ]);

      await engine.initialize();

      expect(first.initialize).toHaveBeenCalledTimes(1);

      expect(second.initialize).toHaveBeenCalledTimes(1);

      const firstOrder = first.initialize.mock.invocationCallOrder[0];

      const secondOrder = second.initialize.mock.invocationCallOrder[0];

      expect(firstOrder).toBeLessThan(secondOrder);
    });

    it("should build runtime after provider initialization", async () => {
      const engine = InstrumentationEngine.create({}, [createProvider()]);

      const runtime = await engine.initialize();

      expect(runtime).toEqual(createRuntime());

      expect(InstrumentationRuntimeBuilder.create).toHaveBeenCalledTimes(1);
    });

    it("should reject initialization when engine is already initialized", async () => {
      const engine = InstrumentationEngine.create({}, [createProvider()]);

      await engine.initialize();

      await expect(engine.initialize()).rejects.toThrow(
        "InstrumentationEngine cannot execute",
      );
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("failure handling", () => {
    it("should propagate provider initialization failure", async () => {
      const error = new Error("provider initialization failed");

      const provider = createProvider();

      provider.initialize.mockRejectedValue(error);

      const engine = InstrumentationEngine.create({}, [provider]);

      await expect(engine.initialize()).rejects.toThrow(
        "provider initialization failed",
      );
    });
  });

  /* ===========================================================================
   * Shutdown
   * ========================================================================= */

  describe("shutdown", () => {
    it("should shutdown providers in reverse order", async () => {
      const first = createProvider("first");

      const second = createProvider("second");

      const engine = InstrumentationEngine.create({}, [first, second]);

      await engine.initialize();

      await engine.shutdown();

      const secondOrder = second.shutdown.mock.invocationCallOrder[0];

      const firstOrder = first.shutdown.mock.invocationCallOrder[0];

      expect(secondOrder).toBeLessThan(firstOrder);
    });

    it("should make shutdown idempotent", async () => {
      const provider = createProvider();

      const engine = InstrumentationEngine.create({}, [provider]);

      await engine.initialize();

      await engine.shutdown();

      await engine.shutdown();

      expect(provider.shutdown).toHaveBeenCalledTimes(1);
    });
  });

  /* ===========================================================================
   * Provider contract
   * ========================================================================= */

  describe("provider resolution", () => {
    it("should use injected providers instead of internal providers", async () => {
      const provider = createProvider();

      const engine = InstrumentationEngine.create({}, [provider]);

      await engine.initialize();

      expect(provider.initialize).toHaveBeenCalled();
    });
  });
});

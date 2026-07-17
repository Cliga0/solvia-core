import { PipelineEngine } from "../pipeline.engine";

import type { BootstrapRuntimeContext } from "../../runtime/contracts/bootstrap-runtime-context";
import type { BootstrapActionRegistry } from "../../actions/bootstrap-action.registry";
import type { BootstrapPhase } from "../../contracts/bootstrap-phase";

/* =============================================================================
 * Pipeline Engine Tests
 * =============================================================================
 *
 * Contract tests for bootstrap orchestration boundary.
 *
 * Guarantees:
 *
 * • factory construction
 * • runtime context preservation
 * • phase discovery
 * • internal phase isolation
 * • lifecycle orchestration
 * • execution delegation
 * • pipeline immutability
 * • discovery idempotency
 *
 * =============================================================================
 */

describe("PipelineEngine", () => {
  const createContext = (): BootstrapRuntimeContext =>
    ({
      id: "runtime-context",
    }) as BootstrapRuntimeContext;

  const createPhase = (
    overrides: Partial<BootstrapPhase> = {},
  ): BootstrapPhase =>
    ({
      name: "initialize",

      order: 0,

      internal: false,

      ...overrides,
    }) as BootstrapPhase;

  const createRegistry = (
    overrides: Partial<BootstrapActionRegistry> = {},
  ): BootstrapActionRegistry =>
    ({
      all: jest.fn().mockReturnValue([
        {
          phase: createPhase(),
        },
      ]),

      resolve: jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),

      ...overrides,
    }) as BootstrapActionRegistry;

  const createEngine = (
    registry = createRegistry(),
    context = createContext(),
  ): PipelineEngine => PipelineEngine.create(context, registry);

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  describe("factory", () => {
    it("should create engine instance", () => {
      const engine = createEngine();

      expect(engine).toBeInstanceOf(PipelineEngine);
    });

    it("should preserve runtime context reference", () => {
      const context = createContext();

      const engine = createEngine(createRegistry(), context);

      expect(engine.context).toBe(context);
    });
  });

  /* ===========================================================================
   * Discovery
   * ========================================================================= */

  describe("phase discovery", () => {
    it("should discover executable phases from registry", async () => {
      const registry = createRegistry();

      const result = await createEngine(registry).execute();

      expect(result.success).toBe(true);

      expect(registry.all).toHaveBeenCalledTimes(1);
    });

    it("should exclude internal phases from execution", async () => {
      const publicPhase = createPhase({
        name: "public",
      });

      const internalPhase = createPhase({
        name: "internal",
        internal: true,
      });

      const resolve = jest.fn().mockReturnValue({
        execute: jest.fn(),
      });

      const registry = createRegistry({
        all: jest.fn().mockReturnValue([
          {
            phase: publicPhase,
          },

          {
            phase: internalPhase,
          },
        ]),

        resolve,
      });

      const result = await createEngine(registry).execute();

      expect(result.success).toBe(true);

      expect(resolve).toHaveBeenCalledTimes(1);

      expect(resolve).toHaveBeenCalledWith(publicPhase);
    });
  });

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  describe("execution lifecycle", () => {
    it("should execute complete bootstrap lifecycle", async () => {
      const calls: string[] = [];

      const registry = createRegistry({
        resolve: jest.fn().mockReturnValue({
          execute: async () => {
            calls.push("execute");
          },
        }),
      });

      const result = await createEngine(registry).execute();

      expect(result.success).toBe(true);

      expect(calls).toEqual(["execute"]);
    });

    it("should return executor result contract", async () => {
      const result = await createEngine().execute();

      expect(result.id).toBeDefined();

      expect(result.duration).toBeGreaterThanOrEqual(0);

      expect(result.metadata.executor).toBe("pipeline-executor");
    });
  });

  /* ===========================================================================
   * Mutation rules
   * ========================================================================= */

  describe("mutation rules", () => {
    it("should allow phase registration before execution", () => {
      const engine = createEngine();

      expect(() =>
        engine.addPhase(
          createPhase({
            name: "custom",
          }),
        ),
      ).not.toThrow();
    });

    it("should reject modification after first execution", async () => {
      const engine = createEngine();

      await engine.execute();

      expect(() =>
        engine.addPhase(
          createPhase({
            name: "late",
          }),
        ),
      ).toThrow("PipelineEngine is already built and cannot be modified.");
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("failure propagation", () => {
    it("should expose failed pipeline result", async () => {
      const error = new Error("bootstrap failed");

      const registry = createRegistry({
        resolve: jest.fn().mockReturnValue({
          execute: async () => {
            throw error;
          },
        }),
      });

      const result = await createEngine(registry).execute();

      expect(result.success).toBe(false);

      expect(result.error).toBe(error);
    });
  });

  /* ===========================================================================
   * Idempotency
   * ========================================================================= */

  describe("idempotency", () => {
    it("should discover registry phases only once", async () => {
      const registry = createRegistry();

      const engine = createEngine(registry);

      await engine.execute();

      await engine.execute();

      expect(registry.all).toHaveBeenCalledTimes(1);
    });
  });
});

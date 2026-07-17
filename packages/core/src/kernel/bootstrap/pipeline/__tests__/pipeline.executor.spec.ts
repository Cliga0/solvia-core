import { PipelineExecutor } from "../pipeline.executor";

import type { BootstrapActionRegistry } from "../../actions/bootstrap-action.registry";
import type { BootstrapRuntimeContext } from "../../runtime/contracts/bootstrap-runtime-context";
import type { BootstrapPhase } from "../../contracts/bootstrap-phase";
import type { ExecutionPlan } from "../contracts/execution-plan";

/* =============================================================================
 * Pipeline Executor Tests
 * =============================================================================
 *
 * Contract tests for bootstrap pipeline execution runtime.
 *
 * These tests validate runtime guarantees:
 *
 * • deterministic execution
 * • action resolution
 * • failure isolation
 * • immutable reporting
 * • diagnostics generation
 *
 * =============================================================================
 */

describe("PipelineExecutor", () => {
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

      ...overrides,
    }) as BootstrapPhase;

  const createPlan = (
    phases: readonly BootstrapPhase[] = [createPhase()],
  ): ExecutionPlan =>
    ({
      id: "execution-plan",

      phases,

      size: phases.length,

      createdAt: new Date(),
    }) as ExecutionPlan;

  const createRegistry = (
    overrides: Partial<BootstrapActionRegistry> = {},
  ): BootstrapActionRegistry =>
    ({
      resolve: jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),

      ...overrides,
    }) as BootstrapActionRegistry;

  const createExecutor = (registry = createRegistry()): PipelineExecutor =>
    new PipelineExecutor(registry);

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("construction", () => {
    it("should create executor instance", () => {
      const executor = createExecutor();

      expect(executor).toBeInstanceOf(PipelineExecutor);
    });
  });

  /* ===========================================================================
   * Execution
   * ========================================================================= */

  describe("execution", () => {
    it("should execute phases sequentially", async () => {
      const events: string[] = [];

      const registry = createRegistry({
        resolve: jest.fn().mockImplementation((phase) => ({
          execute: async () => {
            events.push(phase.name);
          },
        })),
      });

      const result = await createExecutor(registry).execute(
        createPlan([
          createPhase({
            name: "initialize",
          }),

          createPhase({
            name: "runtime",
            order: 1,
          }),

          createPhase({
            name: "ready",
            order: 2,
          }),
        ]),
        createContext(),
      );

      expect(result.success).toBe(true);

      expect(events).toEqual(["initialize", "runtime", "ready"]);
    });

    it("should resolve one action per phase", async () => {
      const resolve = jest.fn().mockReturnValue({
        execute: jest.fn(),
      });

      const registry = createRegistry({
        resolve,
      });

      await createExecutor(registry).execute(
        createPlan([
          createPhase({
            name: "a",
          }),

          createPhase({
            name: "b",
            order: 1,
          }),
        ]),
        createContext(),
      );

      expect(resolve).toHaveBeenCalledTimes(2);
    });

    it("should pass runtime context to actions", async () => {
      const context = createContext();

      const execute = jest.fn();

      const registry = createRegistry({
        resolve: jest.fn().mockReturnValue({
          execute,
        }),
      });

      await createExecutor(registry).execute(createPlan(), context);

      expect(execute).toHaveBeenCalledWith(context);
    });
  });

  /* ===========================================================================
   * Result contract
   * ========================================================================= */

  describe("result contract", () => {
    it("should report executed phase count", async () => {
      const result = await createExecutor().execute(
        createPlan([
          createPhase(),

          createPhase({
            name: "runtime",
            order: 1,
          }),
        ]),
        createContext(),
      );

      expect(result.executed).toBe(2);
    });

    it("should expose executed phases", async () => {
      const phases = [
        createPhase({
          name: "initialize",
        }),
      ];

      const result = await createExecutor().execute(
        createPlan(phases),
        createContext(),
      );

      expect(result.phases).toEqual(phases);
    });

    it("should create immutable result", async () => {
      const result = await createExecutor().execute(
        createPlan(),
        createContext(),
      );

      expect(Object.isFrozen(result)).toBe(true);

      expect(Object.isFrozen(result.phases)).toBe(true);
    });

    it("should expose execution diagnostics", async () => {
      const result = await createExecutor().execute(
        createPlan(),
        createContext(),
      );

      expect(result.metadata).toEqual({
        executor: "pipeline-executor",
      });
    });

    it("should generate unique execution identifiers", async () => {
      const executor = createExecutor();

      const first = await executor.execute(createPlan(), createContext());

      const second = await executor.execute(createPlan(), createContext());

      expect(first.id).not.toBe(second.id);
    });

    it("should expose valid duration", async () => {
      const result = await createExecutor().execute(
        createPlan(),
        createContext(),
      );

      expect(result.duration).toBeGreaterThanOrEqual(0);

      expect(result.completedAt.getTime()).toBeGreaterThanOrEqual(
        result.startedAt.getTime(),
      );
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("failure handling", () => {
    it("should capture execution failure", async () => {
      const error = new Error("phase failed");

      const registry = createRegistry({
        resolve: jest.fn().mockReturnValue({
          execute: async () => {
            throw error;
          },
        }),
      });

      const result = await createExecutor(registry).execute(
        createPlan(),
        createContext(),
      );

      expect(result.success).toBe(false);

      expect(result.error).toBe(error);
    });

    it("should stop after first failing phase", async () => {
      const events: string[] = [];

      const registry = createRegistry({
        resolve: jest.fn().mockImplementation((phase) => ({
          execute: async () => {
            events.push(phase.name);

            if (phase.name === "failure") {
              throw new Error("boom");
            }
          },
        })),
      });

      const result = await createExecutor(registry).execute(
        createPlan([
          createPhase({
            name: "first",
          }),

          createPhase({
            name: "failure",
            order: 1,
          }),

          createPhase({
            name: "never",
            order: 2,
          }),
        ]),
        createContext(),
      );

      expect(result.success).toBe(false);

      expect(events).toEqual(["first", "failure"]);
    });

    it("should normalize unknown thrown values", async () => {
      const registry = createRegistry({
        resolve: jest.fn().mockReturnValue({
          execute: async () => {
            throw "unexpected";
          },
        }),
      });

      const result = await createExecutor(registry).execute(
        createPlan(),
        createContext(),
      );

      expect(result.error).toBeInstanceOf(Error);

      expect(result.error?.message).toBe("unexpected");
    });
  });

  /* ===========================================================================
   * Isolation
   * ========================================================================= */

  describe("isolation", () => {
    it("should not mutate execution plan", async () => {
      const plan = createPlan([
        createPhase({
          name: "initialize",
        }),
      ]);

      const before = structuredClone(plan);

      await createExecutor().execute(plan, createContext());

      expect(plan).toEqual(before);
    });
  });
});

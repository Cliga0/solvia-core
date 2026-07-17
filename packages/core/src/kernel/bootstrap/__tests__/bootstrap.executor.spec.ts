import { BootstrapExecutor } from "../bootstrap.executor";

import { BootstrapExecutionMode } from "../enums/bootstrap-execution-mode.enum";

import { BootstrapValidator } from "../bootstrap.validator";

import { PhaseExecutor } from "../phase.executor";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

import type { BootstrapPlan, BootstrapStep } from "../contracts/bootstrap-plan";

import type { BootstrapAction } from "../contracts/bootstrap-action";

/* =============================================================================
 * Bootstrap Executor Tests
 * =============================================================================
 *
 * Contract tests for bootstrap runtime execution.
 *
 * =============================================================================
 */

jest.mock("../phase.executor");

describe("BootstrapExecutor", () => {
  type ActionExecutor = (
    context: BootstrapRuntimeContext,
  ) => Promise<void> | void;

  /* ===========================================================================
   * Fixtures
   * ========================================================================= */

  const createContext = (): BootstrapRuntimeContext =>
    ({
      environment: "test",
    }) as BootstrapRuntimeContext;

  const createAction = (
    name: string,
    execute: ActionExecutor = jest.fn(),
  ): BootstrapAction =>
    ({
      phase: {
        name,

        order: 1,
      },

      execute,
    }) as BootstrapAction;

  const createStep = (
    name = "database",

    execute: ActionExecutor = jest.fn(),
  ): BootstrapStep =>
    ({
      phase: {
        name,

        order: 1,
      },

      action: createAction(name, execute),

      dependencies: [],

      metadata: {},
    }) as BootstrapStep;

  const createPlan = (
    steps: readonly BootstrapStep[] = [createStep()],
  ): BootstrapPlan => ({
    id: "bootstrap-test",

    version: 1,

    steps,

    count: steps.length,

    createdAt: new Date(),

    metadata: {},
  });

  const mockPhaseExecutor = (): jest.Mock =>
    PhaseExecutor.prototype.execute as jest.Mock;

  /* ===========================================================================
   * Setup
   * ========================================================================= */

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(BootstrapValidator, "validate")
      .mockImplementation(() => undefined);

    jest.spyOn(PhaseExecutor.prototype, "execute").mockResolvedValue(undefined);
  });

  /* ===========================================================================
   * Validation Boundary
   * ========================================================================= */

  describe("validation", () => {
    it("should validate bootstrap plan before execution", async () => {
      const validator = jest.spyOn(BootstrapValidator, "validate");

      const executor = new BootstrapExecutor(createContext());

      await executor.execute(createPlan());

      expect(validator).toHaveBeenCalledTimes(1);

      expect(validator).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  /* ===========================================================================
   * Sequential Execution
   * ========================================================================= */

  describe("sequential execution", () => {
    it("should execute phases sequentially by default", async () => {
      const executionOrder: string[] = [];

      mockPhaseExecutor().mockImplementation(
        async (action: BootstrapAction) => {
          await action.execute(createContext());
        },
      );

      const plan = createPlan([
        createStep("database", () => {
          executionOrder.push("database");
        }),

        createStep("application", () => {
          executionOrder.push("application");
        }),
      ]);

      const executor = new BootstrapExecutor(createContext());

      const result = await executor.execute(plan);

      expect(executionOrder).toEqual(["database", "application"]);

      expect(result.success).toBe(true);
    });
  });

  /* ===========================================================================
   * Parallel Execution
   * ========================================================================= */

  describe("parallel execution", () => {
    it("should execute every phase concurrently", async () => {
      const executor = new BootstrapExecutor(
        createContext(),

        {
          mode: BootstrapExecutionMode.PARALLEL,
        },
      );

      const result = await executor.execute(
        createPlan([createStep("database"), createStep("application")]),
      );

      expect(mockPhaseExecutor()).toHaveBeenCalledTimes(2);

      expect(result.success).toBe(true);
    });
  });

  /* ===========================================================================
   * Dry Run
   * ========================================================================= */

  describe("dry run", () => {
    it("should skip execution when dryRun is enabled", async () => {
      const executor = new BootstrapExecutor(
        createContext(),

        {
          dryRun: true,
        },
      );

      const result = await executor.execute(createPlan());

      expect(mockPhaseExecutor()).not.toHaveBeenCalled();

      expect(result.success).toBe(true);

      expect(result.metadata).toMatchObject({
        dryRun: true,
      });
    });
  });

  /* ===========================================================================
   * Failure Handling
   * ========================================================================= */

  describe("failure handling", () => {
    it("should convert execution failures into failed bootstrap result", async () => {
      const error = new Error("database failure");

      mockPhaseExecutor().mockRejectedValue(error);

      const executor = new BootstrapExecutor(createContext());

      const result = await executor.execute(createPlan());

      expect(result.success).toBe(false);

      expect(result.error).toBe(error);
    });
  });

  /* ===========================================================================
   * Result Contract
   * ========================================================================= */

  describe("result contract", () => {
    it("should return immutable successful result", async () => {
      const executor = new BootstrapExecutor(createContext());

      const result = await executor.execute(createPlan());

      expect(Object.isFrozen(result)).toBe(true);

      expect(Object.isFrozen(result.metadata)).toBe(true);
    });

    it("should expose execution metrics", async () => {
      const executor = new BootstrapExecutor(createContext());

      const result = await executor.execute(
        createPlan([createStep("database"), createStep("application")]),
      );

      expect(result.metadata).toMatchObject({
        planId: "bootstrap-test",

        version: 1,

        executed: 2,
      });
    });
  });
});

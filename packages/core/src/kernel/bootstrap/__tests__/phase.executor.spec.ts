import { PhaseExecutor } from "../phase.executor";

import type { BootstrapAction } from "../contracts/bootstrap-action";

import type { BootstrapRuntimeContext } from "../runtime/contracts/bootstrap-runtime-context";

/* =============================================================================
 * Phase Executor Tests
 * =============================================================================
 *
 * Contract tests for bootstrap phase execution boundary.
 *
 * =============================================================================
 */

describe("PhaseExecutor", () => {
  /* ===========================================================================
   * Fixtures
   * ========================================================================= */

  const createContext = (): BootstrapRuntimeContext =>
    ({
      enterPhase: jest.fn(),

      completePhase: jest.fn(),

      failPhase: jest.fn(),
    }) as unknown as BootstrapRuntimeContext;

  const createPhase = () => ({
    name: "database",

    order: 1,
  });

  const createAction = (
    execute: BootstrapAction["execute"] = jest.fn(),
  ): BootstrapAction =>
    ({
      phase: createPhase(),

      execute,
    }) as BootstrapAction;

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("construction", () => {
    it("should preserve provided runtime context", () => {
      const context = createContext();

      const executor = new PhaseExecutor(context);

      expect(executor.context).toBe(context);
    });
  });

  /* ===========================================================================
   * Successful execution
   * ========================================================================= */

  describe("execution success", () => {
    it("should execute bootstrap action with runtime context", async () => {
      const context = createContext();

      const execute = jest.fn().mockResolvedValue(undefined);

      const action = createAction(execute);

      const executor = new PhaseExecutor(context);

      await executor.execute(action);

      expect(execute).toHaveBeenCalledTimes(1);

      expect(execute).toHaveBeenCalledWith(context);
    });

    it("should enter phase before execution", async () => {
      const calls: string[] = [];

      const context = createContext();

      (context.enterPhase as jest.Mock).mockImplementation(() => {
        calls.push("enter");
      });

      const action = createAction(async () => {
        calls.push("execute");
      });

      const executor = new PhaseExecutor(context);

      await executor.execute(action);

      expect(calls).toEqual(["enter", "execute"]);
    });

    it("should complete phase after successful execution", async () => {
      const context = createContext();

      const action = createAction();

      const executor = new PhaseExecutor(context);

      await executor.execute(action);

      expect(context.completePhase).toHaveBeenCalledTimes(1);

      expect(context.completePhase).toHaveBeenCalledWith(action.phase);
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("execution failure", () => {
    it("should mark phase as failed when execution throws", async () => {
      const context = createContext();

      const error = new Error("database unavailable");

      const action = createAction(async () => {
        throw error;
      });

      const executor = new PhaseExecutor(context);

      await expect(executor.execute(action)).rejects.toThrow(
        "database unavailable",
      );

      expect(context.failPhase).toHaveBeenCalledTimes(1);

      expect(context.failPhase).toHaveBeenCalledWith(action.phase, error);
    });

    it("should not complete failed phases", async () => {
      const context = createContext();

      const action = createAction(async () => {
        throw new Error("failure");
      });

      const executor = new PhaseExecutor(context);

      await expect(executor.execute(action)).rejects.toThrow();

      expect(context.completePhase).not.toHaveBeenCalled();
    });

    it("should normalize non Error failures", async () => {
      const context = createContext();

      const action = createAction(async () => {
        throw "fatal";
      });

      const executor = new PhaseExecutor(context);

      await expect(executor.execute(action)).rejects.toEqual("fatal");

      expect(context.failPhase).toHaveBeenCalledWith(
        action.phase,
        expect.any(Error),
      );
    });
  });

  /* ===========================================================================
   * Async behavior
   * ========================================================================= */

  describe("async behavior", () => {
    it("should await asynchronous bootstrap actions", async () => {
      const context = createContext();

      let completed = false;

      const action = createAction(async () => {
        await Promise.resolve();

        completed = true;
      });

      const executor = new PhaseExecutor(context);

      await executor.execute(action);

      expect(completed).toBe(true);
    });
  });
});

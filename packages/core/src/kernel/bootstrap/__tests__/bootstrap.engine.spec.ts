import { BootstrapEngine } from "../bootstrap.engine";

import { BootstrapExecutor } from "../bootstrap.executor";

import type { BootstrapResult } from "../contracts/bootstrap-result";

import type { BootstrapRuntime } from "../runtime/contracts/bootstrap-runtime";

import type { BootstrapOptions } from "../contracts/bootstrap-options";

import type { BootstrapContext } from "../contracts/bootstrap-context";

import type { DiscoveryResult } from "../discovery/contracts/discovery-result";

import type { RegistrySnapshot } from "../registry/contracts/registry-snapshot";

import type { ContributionManagerRuntime } from "../../contributions/runtime/contribution-manager-runtime";

import type { BootstrapProfile } from "../enums/bootstrap-profile.enum";

/* =============================================================================
 * Bootstrap Engine Tests
 * =============================================================================
 *
 * Contract tests for Kernel bootstrap orchestration facade.
 *
 * =============================================================================
 */

jest.mock("../bootstrap.executor");

describe("BootstrapEngine", () => {
  /* ===========================================================================
   * Fixtures
   * ========================================================================= */

  const createOptions = (): BootstrapOptions =>
    ({
      environment: "test",
    }) as BootstrapOptions;

  const createRuntime = (): BootstrapRuntime =>
    ({
      id: "runtime-test",

      startedAt: new Date(),

      context: {
        environment: "test",
      } as BootstrapContext,

      contributions: {} as ContributionManagerRuntime,

      discovery: {} as DiscoveryResult,

      registry: {} as RegistrySnapshot,

      phases: [],

      profile: "default" as BootstrapProfile,

      environment: "test",

      version: "1.0.0",

      features: [],
    }) satisfies BootstrapRuntime;

  const createSuccessResult = (): BootstrapResult =>
    ({
      success: true,

      runtime: createRuntime(),

      startedAt: new Date(),

      completedAt: new Date(),

      duration: 10,

      metadata: {},
    }) as BootstrapResult;

  const createFailureResult = (
    error = new Error("bootstrap failure"),
  ): BootstrapResult =>
    ({
      success: false,

      error,

      startedAt: new Date(),

      completedAt: new Date(),

      duration: 10,

      metadata: {},
    }) as BootstrapResult;

  const executorMock = BootstrapExecutor.prototype.execute as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ===========================================================================
   * Construction
   * ========================================================================= */

  describe("create", () => {
    it("should create a bootstrap engine instance", () => {
      const engine = BootstrapEngine.create(createOptions());

      expect(engine).toBeInstanceOf(BootstrapEngine);
    });
  });

  /* ===========================================================================
   * Successful bootstrap
   * ========================================================================= */

  describe("boot", () => {
    it("should execute bootstrap and return runtime", async () => {
      const runtime = createRuntime();

      executorMock.mockResolvedValue({
        ...createSuccessResult(),

        runtime,
      });

      const engine = BootstrapEngine.create();

      const result = await engine.boot();

      expect(result).toBe(runtime);

      expect(executorMock).toHaveBeenCalledTimes(1);
    });

    it("should provide a generated immutable bootstrap plan", async () => {
      executorMock.mockResolvedValue(createSuccessResult());

      const engine = BootstrapEngine.create();

      await engine.boot();

      const [plan] = executorMock.mock.calls[0];

      expect(plan).toBeDefined();

      expect(plan.id).toBe("solvia-bootstrap");

      expect(plan.version).toBe(1);

      expect(Object.isFrozen(plan)).toBe(true);
    });
  });

  /* ===========================================================================
   * Failure handling
   * ========================================================================= */

  describe("failure handling", () => {
    it("should propagate bootstrap execution failure", async () => {
      const error = new Error("database bootstrap failed");

      executorMock.mockResolvedValue(createFailureResult(error));

      const engine = BootstrapEngine.create();

      await expect(engine.boot()).rejects.toThrow("database bootstrap failed");
    });

    it("should reject successful execution without runtime", async () => {
      executorMock.mockResolvedValue({
        success: true,

        startedAt: new Date(),

        completedAt: new Date(),

        duration: 5,

        metadata: {},
      });

      const engine = BootstrapEngine.create();

      await expect(engine.boot()).rejects.toThrow(
        "Bootstrap completed without producing runtime.",
      );
    });
  });

  /* ===========================================================================
   * Architecture contract
   * ========================================================================= */

  describe("architecture boundaries", () => {
    it("should delegate execution and not execute actions directly", async () => {
      executorMock.mockResolvedValue(createSuccessResult());

      const engine = BootstrapEngine.create();

      await engine.boot();

      expect(executorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "solvia-bootstrap",

          version: 1,
        }),
      );
    });
  });
});

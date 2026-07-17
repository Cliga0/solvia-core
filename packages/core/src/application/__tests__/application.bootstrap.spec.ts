import type {
  HttpServer,
  INestApplication,
  LoggerService,
} from "@nestjs/common";

import type { BootstrapRuntime } from "../../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import { ApplicationContext, ApplicationState } from "../application.context";

import type { ApplicationOptions } from "../contracts/application.options";

/* =============================================================================
 * Application Context Specification
 * =============================================================================
 *
 * Validates the mutable runtime state container of Solvia Application.
 *
 * Covered:
 *
 * - Identity lifecycle
 * - Configuration isolation
 * - Dependency attachment
 * - Runtime state transitions
 * - Failure handling
 * - Diagnostics
 * - Snapshot immutability
 *
 * =============================================================================
 */

describe("ApplicationContext", () => {
  class TestModule {}

  const createOptions = (): ApplicationOptions => ({
    module: TestModule,

    name: "Solvia Test",

    version: "1.0.0",

    environment: "test",

    metadata: {
      service: "application-context-test",
    },
  });

  const createContext = () => ApplicationContext.create(createOptions());

  describe("creation", () => {
    it("should create a valid application context", () => {
      const context = createContext();

      expect(context).toBeDefined();

      expect(context.id).toEqual(expect.any(String));

      expect(context.startedAt).toBeInstanceOf(Date);

      expect(context.getState()).toBe(ApplicationState.CREATED);
    });

    it("should expose application metadata", () => {
      const context = createContext();

      expect(context.name).toBe("Solvia Test");

      expect(context.version).toBe("1.0.0");

      expect(context.metadata).toEqual({
        service: "application-context-test",
      });
    });

    it("should isolate options from external mutation", () => {
      const options = createOptions();

      const context = ApplicationContext.create(options);

      expect(context.options).not.toBe(options);
    });
  });

  describe("environment diagnostics", () => {
    it("should expose runtime environment information", () => {
      const context = createContext();

      expect(context.processId).toEqual(expect.any(Number));

      expect(context.hostname).toEqual(expect.any(String));

      expect(context.platform).toEqual(process.platform);

      expect(context.nodeVersion).toEqual(process.version);
    });

    it("should expose runtime metrics", () => {
      const context = createContext();

      expect(context.uptime).toEqual(expect.any(Number));

      expect(context.elapsedTime).toEqual(expect.any(Number));

      expect(context.memoryUsage()).toHaveProperty("heapUsed");

      expect(context.cpuUsage()).toHaveProperty("user");
    });
  });

  describe("kernel attachment", () => {
    it("should attach and retrieve kernel runtime", () => {
      const context = createContext();

      const runtime = {} as BootstrapRuntime;

      context.attachKernel(runtime);

      expect(context.getKernel()).toBe(runtime);
    });

    it("should fail when kernel runtime is unavailable", () => {
      const context = createContext();

      expect(() => context.getKernel()).toThrow(
        "Kernel runtime has not been initialized.",
      );
    });
  });

  describe("application attachment", () => {
    it("should attach Nest application", () => {
      const context = createContext();

      const application = {} as INestApplication;

      context.attachApplication(application);

      expect(context.getApplication()).toBe(application);
    });

    it("should reject missing Nest application", () => {
      const context = createContext();

      expect(() => context.getApplication()).toThrow(
        "Nest application has not been created.",
      );
    });
  });

  describe("server attachment", () => {
    it("should attach HTTP server", () => {
      const context = createContext();

      const server = {} as HttpServer;

      context.attachServer(server);

      expect(context.getServer()).toBe(server);
    });

    it("should reject missing HTTP server", () => {
      const context = createContext();

      expect(() => context.getServer()).toThrow("HTTP server is unavailable.");
    });
  });

  describe("logger lifecycle", () => {
    it("should attach logger instance", () => {
      const context = createContext();

      const logger = {} as LoggerService;

      context.attachLogger(logger);

      expect(context.getLogger()).toBe(logger);
    });

    it("should return undefined without logger", () => {
      const context = createContext();

      expect(context.getLogger()).toBeUndefined();
    });
  });

  describe("application lifecycle", () => {
    it("should transition application states", () => {
      const context = createContext();

      context.transition(ApplicationState.BOOTSTRAPPING);

      expect(context.getState()).toBe(ApplicationState.BOOTSTRAPPING);

      context.transition(ApplicationState.RUNNING);

      expect(context.is(ApplicationState.RUNNING)).toBe(true);
    });

    it("should record application failure", () => {
      const context = createContext();

      const error = new Error("startup failure");

      context.fail(error);

      expect(context.getState()).toBe(ApplicationState.FAILED);

      expect(context.getLastError()).toBe(error);
    });
  });

  describe("snapshot", () => {
    it("should produce immutable runtime snapshot", () => {
      const context = createContext();

      const snapshot = context.snapshot();

      expect(snapshot.id).toBe(context.id);

      expect(snapshot.name).toBe(context.name);

      expect(snapshot.version).toBe(context.version);

      expect(snapshot.state).toBe(ApplicationState.CREATED);

      expect(Object.isFrozen(snapshot)).toBe(true);
    });

    it("should keep snapshot stable after lifecycle changes", () => {
      const context = createContext();

      const snapshot = context.snapshot();

      context.transition(ApplicationState.RUNNING);

      expect(snapshot.state).toBe(ApplicationState.CREATED);
    });
  });
});

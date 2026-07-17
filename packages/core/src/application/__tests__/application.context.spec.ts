import type { INestApplication, LoggerService } from "@nestjs/common";
import type { HttpServer } from "@nestjs/common";

import type { BootstrapRuntime } from "../../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import { ApplicationContext, ApplicationState } from "../application.context";

import type { ApplicationOptions } from "../contracts/application.options";

/* =============================================================================
 * Application Context Tests
 * =============================================================================
 *
 * Contract tests for the application runtime state container.
 *
 * =============================================================================
 */

describe("ApplicationContext", () => {
  const createOptions = (
    overrides: Partial<ApplicationOptions> = {},
  ): ApplicationOptions =>
    ({
      name: "Solvia Test",

      version: "1.0.0",

      metadata: {
        test: true,
      },

      ...overrides,
    }) as ApplicationOptions;

  const createContext = (options: ApplicationOptions = createOptions()) =>
    ApplicationContext.create(options);

  describe("creation", () => {
    it("should create application context", () => {
      const context = createContext();

      expect(context).toBeInstanceOf(ApplicationContext);

      expect(context.id).toBeDefined();

      expect(context.startedAt).toBeInstanceOf(Date);
    });

    it("should expose configured application identity", () => {
      const context = createContext();

      expect(context.name).toBe("Solvia Test");

      expect(context.version).toBe("1.0.0");
    });

    it("should expose default identity values", () => {
      const context = createContext({} as ApplicationOptions);

      expect(context.name).toBe("Solvia Application");

      expect(context.version).toBe("0.0.0");
    });
  });

  describe("configuration", () => {
    it("should freeze application options", () => {
      const context = createContext();

      expect(Object.isFrozen(context.options)).toBe(true);
    });

    it("should expose metadata safely", () => {
      const context = createContext();

      expect(context.metadata).toEqual({
        test: true,
      });
    });
  });

  describe("kernel attachment", () => {
    it("should reject missing kernel runtime", () => {
      const context = createContext();

      expect(() => context.getKernel()).toThrow(
        "Kernel runtime has not been initialized.",
      );
    });

    it("should attach and retrieve kernel runtime", () => {
      const context = createContext();

      const runtime = {
        id: "runtime",
      } as BootstrapRuntime;

      const result = context.attachKernel(runtime);

      expect(result).toBe(context);

      expect(context.getKernel()).toBe(runtime);
    });
  });

  describe("application attachment", () => {
    it("should reject missing Nest application", () => {
      const context = createContext();

      expect(() => context.getApplication()).toThrow(
        "Nest application has not been created.",
      );
    });

    it("should attach Nest application", () => {
      const context = createContext();

      const app = {} as INestApplication;

      context.attachApplication(app);

      expect(context.getApplication()).toBe(app);
    });
  });

  describe("server attachment", () => {
    it("should reject missing HTTP server", () => {
      const context = createContext();

      expect(() => context.getServer()).toThrow("HTTP server is unavailable.");
    });

    it("should attach HTTP server", () => {
      const context = createContext();

      const server = {} as HttpServer;

      context.attachServer(server);

      expect(context.getServer()).toBe(server);
    });
  });

  describe("logger lifecycle", () => {
    it("should expose undefined logger before initialization", () => {
      const context = createContext();

      expect(context.getLogger()).toBeUndefined();
    });

    it("should attach logger instance", () => {
      const context = createContext();

      const logger = {} as LoggerService;

      context.attachLogger(logger);

      expect(context.getLogger()).toBe(logger);
    });
  });

  describe("state machine", () => {
    it("should start in CREATED state", () => {
      const context = createContext();

      expect(context.getState()).toBe(ApplicationState.CREATED);
    });

    it("should transition lifecycle state", () => {
      const context = createContext();

      context.transition(ApplicationState.RUNNING);

      expect(context.is(ApplicationState.RUNNING)).toBe(true);
    });

    it("should transition to failed state with error", () => {
      const context = createContext();

      const error = new Error("startup failed");

      context.fail(error);

      expect(context.getState()).toBe(ApplicationState.FAILED);

      expect(context.getLastError()).toBe(error);
    });
  });

  describe("diagnostics", () => {
    it("should expose runtime diagnostics", () => {
      const context = createContext();

      expect(context.uptime).toEqual(expect.any(Number));

      expect(context.elapsedTime).toEqual(expect.any(Number));
    });

    it("should expose memory diagnostics", () => {
      const context = createContext();

      expect(context.memoryUsage()).toHaveProperty("rss");

      expect(context.cpuUsage()).toHaveProperty("user");
    });
  });

  describe("snapshot", () => {
    it("should produce immutable runtime snapshot", () => {
      const context = createContext();

      const snapshot = context.snapshot();

      expect(snapshot.id).toBe(context.id);

      expect(snapshot.name).toBe("Solvia Test");

      expect(Object.isFrozen(snapshot)).toBe(true);
    });

    it("should expose lifecycle state in snapshot", () => {
      const context = createContext();

      context.transition(ApplicationState.RUNNING);

      expect(context.snapshot()).toMatchObject({
        state: ApplicationState.RUNNING,
      });
    });
  });
});

import { Module } from "@nestjs/common";

import { ApplicationBootstrap } from "../../application/application.bootstrap";

import type { ApplicationRuntime } from "../../application/contracts/application.runtime";

import { ServerState } from "../../application/server/server.lifecycle";

/* =============================================================================
 * Test Application Module
 * =============================================================================
 */

@Module({})
class TestApplicationModule {}

/* =============================================================================
 * Application Startup Integration
 * =============================================================================
 *
 * Validates the complete Solvia application startup contract.
 *
 *
 * Startup Pipeline:
 *
 * Configuration
 *      |
 *      v
 * ApplicationBootstrap
 *      |
 *      v
 * ApplicationRuntime
 *
 *
 * Covered:
 *
 * - Application identity
 * - Runtime metadata
 * - Kernel initialization
 * - Instrumentation initialization
 * - Server lifecycle
 * - Runtime immutability
 * - Runtime isolation
 * - Failure handling
 *
 * =============================================================================
 */

describe("Application Startup Integration", () => {
  let runtime: ApplicationRuntime;

  beforeAll(async () => {
    runtime = await ApplicationBootstrap.create({
      module: TestApplicationModule,

      name: "Solvia Integration Test",

      version: "1.0.0",

      environment: "testing",

      server: {
        host: "127.0.0.1",
        port: 0,
      },

      instrumentation: {},

      metadata: {
        test: true,
      },
    }).run();
  });

  afterAll(async () => {
    if (runtime) {
      await runtime.server.stop();
    }
  });

  describe("application startup", () => {
    it("should create application runtime", () => {
      expect(runtime).toBeDefined();

      expect(runtime.id).toEqual(expect.any(String));
    });

    it("should expose application identity", () => {
      expect(runtime.name).toBe("Solvia Integration Test");

      expect(runtime.version).toBe("1.0.0");
    });

    it("should expose runtime environment", () => {
      expect(runtime.environment).toBe("testing");
    });
  });

  describe("kernel integration", () => {
    it("should attach kernel runtime", () => {
      expect(runtime.kernel).toBeDefined();

      expect(runtime.kernel.id).toEqual(expect.any(String));
    });
  });

  describe("instrumentation integration", () => {
    it("should initialize instrumentation runtime", () => {
      expect(runtime.instrumentation).toBeDefined();

      expect(runtime.instrumentation.id).toEqual(expect.any(String));
    });
  });

  describe("server lifecycle", () => {
    it("should create server runtime", () => {
      expect(runtime.server).toBeDefined();

      expect(runtime.host).toBe("127.0.0.1");
    });

    it("should allocate dynamic port", () => {
      expect(runtime.port).toEqual(expect.any(Number));
    });

    it("should start server in running state", () => {
      const snapshot = runtime.server.lifecycleSnapshot();

      expect(snapshot.state).toBe(ServerState.RUNNING);
    });
  });

  describe("runtime invariants", () => {
    it("should produce immutable runtime", () => {
      expect(Object.isFrozen(runtime)).toBe(true);
    });

    it("should mark application ready", () => {
      expect(runtime.ready).toBe(true);
    });

    it("should expose capabilities", () => {
      expect(runtime.capabilities).toBeDefined();

      expect(runtime.capabilities.has("http")).toBe(true);
    });
  });

  describe("startup isolation", () => {
    it("should create independent runtimes", async () => {
      const first = await ApplicationBootstrap.create({
        module: TestApplicationModule,

        environment: "testing",

        server: {
          host: "127.0.0.1",
          port: 0,
        },
      }).run();

      const second = await ApplicationBootstrap.create({
        module: TestApplicationModule,

        environment: "testing",

        server: {
          host: "127.0.0.1",
          port: 0,
        },
      }).run();

      try {
        expect(first.id).not.toBe(second.id);

        expect(first).not.toBe(second);
      } finally {
        await Promise.all([first.server.stop(), second.server.stop()]);
      }
    });
  });

  describe("startup failure handling", () => {
    it("should reject invalid application configuration", async () => {
      await expect(
        ApplicationBootstrap.create({
          module: undefined as never,
        }).run(),
      ).rejects.toThrow();
    });
  });
});

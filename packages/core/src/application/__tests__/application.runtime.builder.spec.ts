import type { INestApplication } from "@nestjs/common";

import { ApplicationContext } from "../application.context";
import { ApplicationRuntimeBuilder } from "../application.runtime.builder";

import type { ApplicationOptions } from "../contracts/application.options";
import type { ApplicationRuntime } from "../contracts/application.runtime";

import type { BootstrapRuntime } from "../../kernel/bootstrap/runtime/contracts/bootstrap-runtime";

import type { InstrumentationRuntime } from "../../instrumentation/contracts/instrumentation-runtime";

import type { ApplicationServer } from "../server/application.server";

/* =============================================================================
 * Fixtures
 * =============================================================================
 */

class TestApplicationModule {}

const createApplicationContext = (): ApplicationContext => {
  const options: ApplicationOptions = {
    module: TestApplicationModule,

    name: "Solvia Test",

    version: "1.0.0",

    environment: "test",
  };

  return ApplicationContext.create(options);
};

const createInstrumentationRuntime = (): InstrumentationRuntime =>
  ({
    id: "instrumentation-test",

    startedAt: new Date(),

    completedAt: new Date(),

    duration: 1,

    environment: "test",

    debug: false,

    attributes: {},

    options: {},

    providers: [],

    metadata: new Map(),

    errors: new Map(),

    healthy: true,

    summary: {
      providerCount: 0,
      enabledProviders: 0,
      failedProviders: 0,
    },

    diagnostics: {
      healthy: true,
      warnings: [],
      failures: [],
    },

    capabilities: [],

    timeline: [],
  }) as InstrumentationRuntime;

const createBootstrapRuntime = (): BootstrapRuntime =>
  ({
    id: "bootstrap-test",

    startedAt: new Date(),

    context: {},

    contributions: {},

    discovery: {},

    registry: {},

    phases: [],

    profile: "default",

    environment: "test",

    version: "1.0.0",

    features: [],
  }) as unknown as BootstrapRuntime;

const createNestApplication = (): INestApplication =>
  ({
    getHttpServer: jest.fn(() => "http-server"),
  }) as unknown as INestApplication;

const createApplicationServer = (): ApplicationServer =>
  ({
    options: {
      host: "127.0.0.1",

      port: 3000,
    },
  }) as ApplicationServer;

const createBuilder = () =>
  ApplicationRuntimeBuilder.create()
    .withContext(createApplicationContext())
    .withInstrumentation(createInstrumentationRuntime())
    .withKernel(createBootstrapRuntime())
    .withApplication(createNestApplication())
    .withServer(createApplicationServer());

/* =============================================================================
 * Tests
 * =============================================================================
 */

describe("ApplicationRuntimeBuilder", () => {
  /* ===========================================================================
   * Validation
   * ========================================================================= */

  describe("validation", () => {
    it("should reject missing application context", () => {
      expect(() => ApplicationRuntimeBuilder.create().build()).toThrow(
        "ApplicationContext is required.",
      );
    });

    it("should reject missing instrumentation runtime", () => {
      expect(() =>
        ApplicationRuntimeBuilder.create()
          .withContext(createApplicationContext())
          .build(),
      ).toThrow("InstrumentationRuntime is required.");
    });

    it("should reject missing kernel runtime", () => {
      expect(() =>
        ApplicationRuntimeBuilder.create()
          .withContext(createApplicationContext())
          .withInstrumentation(createInstrumentationRuntime())
          .build(),
      ).toThrow("BootstrapRuntime is required.");
    });

    it("should reject missing Nest application", () => {
      expect(() =>
        ApplicationRuntimeBuilder.create()
          .withContext(createApplicationContext())
          .withInstrumentation(createInstrumentationRuntime())
          .withKernel(createBootstrapRuntime())
          .build(),
      ).toThrow("INestApplication is required.");
    });

    it("should reject missing application server", () => {
      expect(() =>
        ApplicationRuntimeBuilder.create()
          .withContext(createApplicationContext())
          .withInstrumentation(createInstrumentationRuntime())
          .withKernel(createBootstrapRuntime())
          .withApplication(createNestApplication())
          .build(),
      ).toThrow("ApplicationServer is required.");
    });
  });

  /* ===========================================================================
   * Runtime construction
   * ========================================================================= */

  describe("build", () => {
    it("should build a complete application runtime", () => {
      const runtime = createBuilder().build();

      expect(runtime).toBeDefined();

      expect(runtime.name).toBe("Solvia Test");

      expect(runtime.version).toBe("1.0.0");

      expect(runtime.environment).toBe("test");

      expect(runtime.host).toBe("127.0.0.1");

      expect(runtime.port).toBe(3000);

      expect(runtime.ready).toBe(true);
    });

    it("should preserve runtime dependencies", () => {
      const context = createApplicationContext();

      const instrumentation = createInstrumentationRuntime();

      const kernel = createBootstrapRuntime();

      const application = createNestApplication();

      const server = createApplicationServer();

      const runtime = ApplicationRuntimeBuilder.create()
        .withContext(context)
        .withInstrumentation(instrumentation)
        .withKernel(kernel)
        .withApplication(application)
        .withServer(server)
        .build();

      expect(runtime.instrumentation).toBe(instrumentation);

      expect(runtime.kernel).toBe(kernel);

      expect(runtime.application).toBe(application);
    });
  });

  /* ===========================================================================
   * Capabilities
   * ========================================================================= */

  describe("capabilities", () => {
    it("should expose HTTP capability", () => {
      const runtime = createBuilder().build();

      expect(runtime.capabilities.has("http")).toBe(true);
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata", () => {
    it("should create immutable metadata", () => {
      const runtime = createBuilder().build();

      expect(runtime.metadata).toEqual({});

      expect(Object.isFrozen(runtime.metadata)).toBe(true);
    });
  });

  /* ===========================================================================
   * Immutability
   * ========================================================================= */

  describe("immutability", () => {
    it("should freeze the runtime object", () => {
      const runtime = createBuilder().build();

      expect(Object.isFrozen(runtime)).toBe(true);
    });
  });

  /* ===========================================================================
   * Server binding
   * ========================================================================= */

  describe("server", () => {
    it("should preserve application server instance", () => {
      const server = createApplicationServer();

      const runtime = createBuilder().withServer(server).build();

      expect(runtime.server).toBe(server);
    });
  });
});

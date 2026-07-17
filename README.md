# Solvia

> A modular, framework-agnostic backend application framework built on top of NestJS, with a declarative contribution (plugin) system, deterministic bootstrap pipeline, and integrated instrumentation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![Jest](https://img.shields.io/badge/Tests-Jest-3.x-C21325.svg)](https://jestjs.io/)

---

## Table of Contents

1. [Overview](#overview)
2. [Key Characteristics](#key-characteristics)
3. [Monorepo Structure](#monorepo-structure)
4. [Architecture](#architecture)
   - [Layered Architecture](#layered-architecture)
   - [Bootstrap Pipeline](#bootstrap-pipeline)
   - [Contribution System](#contribution-system)
   - [Instrumentation](#instrumentation)
   - [Server Runtime](#server-runtime)
5. [Public API](#public-api)
6. [Usage Guide](#usage-guide)
   - [Installation](#installation)
   - [Starting the API](#starting-the-api)
   - [Configuring the Application](#configuring-the-application)
   - [Using the Kernel as a Nest Module](#using-the-kernel-as-a-nest-module)
   - [Creating a Contribution](#creating-a-contribution)
   - [Instrumentation Configuration](#instrumentation-configuration)
7. [Testing](#testing)
8. [Design Principles](#design-principles)
9. [Extension Points](#extension-points)
10. [Glossary](#glossary)

---

## Overview

**Solvia** is a TypeScript monorepo implementing a production-grade backend application framework. It is built around three core ideas:

1. **A deterministic, declarative bootstrap pipeline** that orchestrates the entire application startup lifecycle.
2. **A contribution (plugin) system** that allows modular capabilities to be discovered, dependency-resolved, loaded, and lifecycle-managed — without coupling the kernel to any specific framework.
3. **Integrated instrumentation** (OpenTelemetry, Prometheus, Sentry, Console) with a uniform provider contract.

The framework is built on top of **NestJS** but keeps the kernel itself framework-agnostic via an adapter layer. This means the core bootstrap logic, contribution resolution, and registry construction do not depend on NestJS directly — the Nest adapter translates the kernel's immutable runtime artifacts into NestJS `DynamicModule` metadata at the boundary.

---

## Key Characteristics

| Characteristic | Description |
|---|---|
| **Immutable runtimes** | All runtime artifacts (`BootstrapRuntime`, `ApplicationRuntime`, `InstrumentationRuntime`, `ContributionRuntime`) are frozen with `Object.freeze()` at construction time. |
| **Deterministic ordering** | Bootstrap phases and contributions are ordered deterministically (by phase order, then by name). Dependency cycles are detected and rejected. |
| **Single responsibility** | Every class has one role (Builder, Validator, Executor, Adapter, Engine, Factory, etc.). |
| **Framework-agnostic kernel** | The kernel never imports NestJS directly. The `adapters/nest/` layer performs the translation. |
| **Graceful shutdown** | Ordered shutdown hooks with priorities (SERVER → INSTRUMENTATION → APPLICATION → DATABASE → CACHE → WORKERS). Timeout-enforced. |
| **Health checks** | Separate readiness (can the server receive traffic?) and liveness (is the process alive?) probes. |
| **Extension points** | Many subsystems declare explicit extension points for future capabilities (filesystem discovery, remote plugins, hot reload, profiling). |

---

## Monorepo Structure

```
solvia/
├── package.json              # Root workspace manifest
├── tsconfig.base.json        # Shared TypeScript configuration
├── apps/
│   └── api/                  # Final application (entry point)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── main.ts        # bootstrapSolvia({ module: AppModule })
│           └── app.module.ts  # Root Nest module
└── packages/
    └── core/                 # @solvia/core — the framework
        ├── package.json
        ├── tsconfig.json
        ├── jest.config.ts
        └── src/
            ├── index.ts                  # Public exports
            ├── solvia.core.ts            # bootstrapSolvia() entry
            ├── application/              # Application layer
            ├── kernel/                   # Kernel (bootstrap + contributions)
            └── instrumentation/          # Instrumentation providers
```

### Workspaces

| Workspace | Package name | Purpose |
|---|---|---|
| `packages/core` | `@solvia/core` | The framework itself |
| `apps/api` | `@solvia/api` | Example application consuming the framework |

---

## Architecture

### Layered Architecture

The framework is organized into three main layers, each with a clearly defined responsibility.

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│   (ApplicationBootstrap, ApplicationContext, Server)    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    Kernel Layer                          │
│  (Bootstrap Engine, Contributions, Pipeline, Registry)  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                Instrumentation Layer                     │
│      (OpenTelemetry, Prometheus, Sentry, Console)       │
└─────────────────────────────────────────────────────────┘
```

#### 1. Application Layer (`packages/core/src/application/`)

The application layer orchestrates the complete application lifecycle.

| Component | File | Responsibility |
|---|---|---|
| `ApplicationBootstrap` | `application.bootstrap.ts` | Main lifecycle orchestrator. Validates config, starts instrumentation, starts kernel, creates Nest app, configures, creates server, starts server, builds runtime. |
| `ApplicationContext` | `application.context.ts` | Mutable runtime state container (identity, environment, attached kernel/app/server/logger, lifecycle state machine). |
| `ApplicationFactory` | `application.factory.ts` | Creates the Nest application via `NestFactory.create()`. Translates runtime options to Nest options. |
| `ApplicationConfigurator` | `application.configurator.ts` | Runs an ordered pipeline of `ApplicationConfigurationStep` instances (logging, validation, security, etc. — currently extension points). |
| `ApplicationRuntimeBuilder` | `application.runtime.builder.ts` | Assembles and freezes the final immutable `ApplicationRuntime`. |
| `ApplicationServer` | `server/application.server.ts` | Runtime owner of the HTTP server. Coordinates lifecycle, shutdown, and health. |
| `ServerBuilder` | `server/server.builder.ts` | Composes the complete server runtime (lifecycle + shutdown + health). |
| `ServerLifecycle` | `server/server.lifecycle.ts` | Stateful lifecycle controller with validated transitions (CREATED → STARTING → RUNNING → STOPPING → STOPPED / FAILED). |
| `GracefulShutdown` | `server/graceful-shutdown.ts` | Production-grade shutdown coordinator. Handles OS signals (SIGTERM, SIGINT), ordered hook execution, timeout enforcement, single-execution guarantee. |
| `ReadinessChecker` / `LivenessChecker` | `server/health/` | Health probes. Readiness = "can receive traffic?" (requires RUNNING state). Liveness = "is the process alive?" (fails on STOPPED/FAILED). |

**Application state machine:**

```
CREATED → BOOTSTRAPPING → BUILDING_KERNEL → CREATING_APPLICATION
       → CONFIGURING → STARTING → RUNNING → STOPPING → STOPPED
                                                                ↘ FAILED
```

**Server state machine:**

```
CREATED → STARTING → RUNNING → STOPPING → STOPPED
                                              ↘ FAILED
```

Allowed transitions are enforced by `ServerLifecycle.TRANSITIONS`.

#### 2. Kernel Layer (`packages/core/src/kernel/`)

The kernel is the heart of the framework. It is split into two subsystems:

##### 2a. Bootstrap Subsystem (`kernel/bootstrap/`)

| Component | File | Responsibility |
|---|---|---|
| `BootstrapLoader` | `bootstrap.loader.ts` | Public entry point. Normalizes options, creates engine, returns frozen runtime. Exposes `load()` and `loadAsync()`. |
| `BootstrapEngine` | `bootstrap.engine.ts` | Orchestration facade. Creates runtime context, composes action registry, builds plan, delegates execution. |
| `BootstrapBuilder` | `bootstrap.builder.ts` | Builds the immutable `BootstrapPlan` from registered actions. Prevents duplicate phases. |
| `BootstrapExecutor` | `bootstrap.executor.ts` | Executes a validated plan. Supports sequential, parallel, and dry-run modes. |
| `BootstrapValidator` | `bootstrap.validator.ts` | Safety boundary between planning and execution. Validates identity, steps, ordering, duplicates, dependencies, metadata. |
| `PhaseExecutor` | `phase.executor.ts` | Execution boundary for a single action. Manages phase lifecycle transitions (enter → execute → complete/fail). |
| `PipelineEngine` | `pipeline/pipeline.engine.ts` | Public orchestration facade for the pipeline. Build → Validate → Execute. |
| `PipelineBuilder` | `pipeline/pipeline.builder.ts` | Constructs immutable `ExecutionPlan` from phases. |
| `PipelineValidator` | `pipeline/pipeline.validator.ts` | Validates plan identity, non-emptiness, phase names, ordering, duplicate orders. |
| `PipelineExecutor` | `pipeline/pipeline.executor.ts` | Executes the plan, resolves actions via registry, produces immutable `PipelineResult`. |
| `BootstrapActionRegistry` | `actions/bootstrap-action.registry.ts` | Immutable capability catalog. Register → Seal → Resolve. |
| `BootstrapOptionsValidator` | `validators/bootstrap-options.validator.ts` | Validates bootstrap options (profile). |

**Bootstrap phases** (defined in `contracts/bootstrap-phase.catalog.ts`):

| Phase | Order | Internal | Action |
|---|---|---|---|
| `initialize` | 10 | no | `InitializeAction` |
| `resolve-contributions` | 20 | no | `ResolveContributionsAction` |
| `load-contributions` | 30 | no | `LoadContributionsAction` |
| `discovery` | 40 | no | `DiscoveryAction` |
| `registry` | 50 | no | `RegistryAction` |
| `pipeline` | 60 | yes | `PipelineAction` (internal) |
| `runtime` | 70 | no | `RuntimeAction` |

Internal phases are excluded from the pipeline execution (the pipeline itself is a phase).

**Registry strategies** (`kernel/bootstrap/registry/strategies/`):

| Strategy | Order | Collects |
|---|---|---|
| `ModuleRegistry` | 10 | Discovered modules + contributed imports |
| `ProviderRegistry` | 20 | Discovered providers + contributed providers |
| `MiddlewareRegistry` | 30 | Discovered + contributed middlewares |

Future strategies (declared but not yet implemented): Controller, Guard, Interceptor, Filter.

**NestJS adapter** (`kernel/bootstrap/adapters/nest/`):

| Component | File | Responsibility |
|---|---|---|
| `BootstrapNestModule` | `bootstrap-nest.module.ts` | NestJS integration. `forRoot()` / `forRootAsync()` return a `DynamicModule`. |
| `BootstrapFactory` | `bootstrap.factory.ts` | Converts `BootstrapRuntime` into Nest `DynamicModule`. |
| `NestRuntimeAdapter` | `nest-runtime.adapter.ts` | Translates `RegistrySnapshot` into `NestRuntimeMetadata`. |
| `DynamicModuleBuilder` | `dynamic-module.builder.ts` | Materializes a Nest `DynamicModule` from adapter metadata. |

##### 2b. Contributions Subsystem (`kernel/contributions/`)

The contribution system is the plugin architecture of Solvia.

| Component | File | Responsibility |
|---|---|---|
| `ContributionResolver` | `resolver/contribution.resolver.ts` | Resolution pipeline: discover → normalize → instantiate → validate → resolve dependencies → order. |
| `ContributionSourceResolver` | `resolver/contribution.source-resolver.ts` | Discovers definitions from 4 sources: explicit, workspace, packages, plugins. |
| `ContributionFactory` | `factory/contribution.factory.ts` | Creates immutable `KernelContribution` instances from definitions. |
| `ContributionInstantiator` | `factory/contribution.instantiator.ts` | Instantiates contribution objects, verifies runtime contract. |
| `ContributionLoader` | `loader/contribution.loader.ts` | Orchestrates loading: register → build contexts → build runtimes → execute lifecycle → publish. |
| `ContributionLifecycle` | `lifecycle/contribution.lifecycle.ts` | Executes lifecycle hooks for a single contribution. Handles rollback on failure. |
| `ContributionCatalog` | `registry/contribution.catalog.ts` | Canonical registry governing every contribution. |
| `ContributionStore` | `registry/contribution.store.ts` | Internal persistence layer (in-memory maps). |
| `DependencyGraph` | `resolver/dependency.graph.ts` | Immutable directed graph of contribution dependencies. |
| `DependencyValidator` | `resolver/dependency.validator.ts` | Validates graph integrity (names, references, self-deps, edge consistency). |
| `DependencyCycleDetector` | `resolver/dependency.cycle-detector.ts` | DFS-based circular dependency detection with diagnostic chain output. |
| `TopologicalSorter` | `resolver/topological-sorter.ts` | Kahn's algorithm for deterministic execution order. |
| `ContributionSorter` | `resolver/contribution.sorter.ts` | Alphabetical tie-breaker for deterministic ordering. |
| `ContributionValidator` | `validator/contribution.validator.ts` | Validates contribution identity, manifest, dependencies, hooks, metadata. |
| `ContributionNormalizer` | `normalization/contribution.normalizer.ts` | Normalizes definitions (trims names, defaults, freezes collections). |
| `KernelContributionNormalizer` | `normalization/kernel-contribution.normalizer.ts` | Normalizes instantiated contributions. |
| `ContributionContextBuilder` | `builder/contribution-context.builder.ts` | Builds immutable `ContributionContext` for lifecycle hooks. |
| `ContributionRuntimeBuilder` | `builder/contribution-runtime.builder.ts` | Builds immutable `ContributionRuntime` instances. |
| `ContributionManagerRuntimeBuilder` | `builder/contribution-manager-runtime.builder.ts` | Builds the immutable `ContributionManagerRuntime` facade. |

**Contribution lifecycle:**

```
REGISTERED → LOADING → LOADED → STARTING → RUNNING → STOPPING → STOPPED
                                                                ↘ FAILED
```

**Lifecycle hooks** (defined in `lifecycle/contribution.hooks.ts`):

| Hook | When | Use case |
|---|---|---|
| `beforeLoad` | Before loading | Validate configuration, prepare state |
| `load` | Loading | Initialize services, register internal objects |
| `afterLoad` | After loading | Post-load cleanup |
| `beforeStart` | Before activation | Pre-activation checks |
| `start` | Activation | Contribution becomes operational |
| `ready` | Kernel fully ready | Post-bootstrap actions |
| `stop` | Graceful stop | Release resources |
| `destroy` | Final cleanup | Final teardown |
| `error` | Lifecycle failure | Error notification (never interrupts lifecycle) |

**Resolution pipeline:**

```
Sources (explicit, workspace, packages, plugins)
    │
    ▼
ContributionDefinition[]
    │
    ▼
ContributionNormalizer.normalize()
    │
    ▼
ContributionFactory.createMany()  →  KernelContribution[]
    │
    ▼
ContributionValidator.validateMany()
    │
    ▼
DependencyGraph.create()
    │
    ▼
DependencyValidator.validate()
    │
    ▼
DependencyCycleDetector.assertNoCycles()
    │
    ▼
TopologicalSorter.sort()
    │
    ▼
ContributionSorter.sort()  (deterministic tie-break)
    │
    ▼
readonly KernelContribution[]
```

#### 3. Instrumentation Layer (`packages/core/src/instrumentation/`)

| Component | File | Responsibility |
|---|---|---|
| `InstrumentationEngine` | `instrumentation.engine.ts` | Orchestrates provider lifecycle. Initialize → Ready → Shutdown. |
| `InstrumentationRuntimeContext` | `runtime/instrumentation-runtime.context.ts` | Mutable execution context. Tracks providers, failures, metadata. |
| `InstrumentationRuntimeBuilder` | `runtime/instrumentation-runtime.builder.ts` | Produces immutable `InstrumentationRuntime`. Computes health, summary, diagnostics. |
| `ConsoleProvider` | `providers/console.provider.ts` | Native console metadata. |
| `OpenTelemetryProvider` | `providers/opentelemetry.provider.ts` | OpenTelemetry SDK lifecycle (OTLP + console exporters). |
| `PrometheusProvider` | `providers/prometheus.provider.ts` | Prometheus metrics exposition. |
| `SentryProvider` | `providers/sentry.provider.ts` | Sentry SDK lifecycle (HTTP, Express, GraphQL, Postgres integrations + profiling). |

**Instrumentation state machine:**

```
CREATED → INITIALIZING → READY → SHUTDOWN
                      ↘ FAILED
```

Each provider implements:
- `supports(options)` — whether the provider should activate
- `initialize(context, options)` — initialize the provider
- `shutdown(context)` — release resources

### Bootstrap Pipeline

The complete startup pipeline, from `bootstrapSolvia()` to a running application:

```
bootstrapSolvia(options)
    │
    ▼
ApplicationBootstrap.create(options).run()
    │
    ├─ validate()
    ├─ initialize()                    → extension point
    │
    ├─ startInstrumentation()
    │      └─ InstrumentationEngine.create(options).initialize()
    │           → InstrumentationRuntime
    │
    ├─ startKernel()
    │      └─ BootstrapLoader.loadAsync(options)
    │           └─ BootstrapEngine.create(options).boot()
    │                │
    │                ├─ createPlan()  →  BootstrapBuilder
    │                │                   .add(InitializeAction)
    │                │                   .add(ResolveContributionsAction)
    │                │                   .add(LoadContributionsAction)
    │                │                   .add(DiscoveryAction)
    │                │                   .add(RegistryAction)
    │                │                   .add(PipelineAction)
    │                │                   .add(RuntimeAction)
    │                │                   .build()
    │                │
    │                └─ BootstrapExecutor.execute(plan)
    │                     │
    │                     ├─ initialize         → prepare runtime
    │                     ├─ resolve-contributions → discover + validate + order
    │                     ├─ load-contributions  → lifecycle hooks
    │                     ├─ discovery           → DiscoveryEngine
    │                     ├─ registry            → RegistryEngine
    │                     │   ├─ ModuleRegistry
    │                     │   ├─ ProviderRegistry
    │                     │   └─ MiddlewareRegistry
    │                     ├─ pipeline            → PipelineEngine (internal)
    │                     └─ runtime             → RuntimeBuilder → BootstrapRuntime
    │
    ├─ createApplication()
    │      └─ ApplicationFactory.create(options)
    │           → NestFactory.create(module, nestOptions)
    │           → INestApplication
    │
    ├─ configureApplication()
    │      └─ ApplicationConfigurator.configure(app)
    │           → ordered configuration steps (extension points)
    │
    ├─ createServer()
    │      └─ ServerBuilder.create(app)
    │           .withOptions(serverOptions)
    │           .build()
    │           → ApplicationServer (lifecycle + shutdown + health)
    │
    ├─ configureServer()
    │      └─ server.registerShutdownHook(InstrumentationShutdownHook)
    │      └─ server.registerShutdownHook(ServerShutdownHook)
    │
    ├─ startServer()
    │      └─ application.listen(port, host)
    │
    └─ buildRuntime()
         └─ ApplicationRuntimeBuilder.create()
              .withContext(context)
              .withInstrumentation(instrumentation)
              .withKernel(kernel)
              .withApplication(app)
              .withServer(server)
              .build()
              → ApplicationRuntime (frozen, immutable)
```

### Contribution System

A **contribution** is a declarative capability that extends the Solvia kernel. It is entirely declarative — it defines its identity, dependencies, manifest (infrastructure), and lifecycle hooks. The kernel owns discovery, loading, orchestration, and execution.

**Contract** (`contracts/kernel-contribution.ts`):

```typescript
interface KernelContribution {
  readonly name: string;                    // Stable identifier (e.g. "database")
  readonly version?: string;                // Semantic version
  readonly description?: string;            // Human-readable
  readonly dependencies?: readonly string[];// Required contributions
  readonly manifest: ContributionManifest;  // Infrastructure declaration
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly hooks?: ContributionHooks;       // Lifecycle callbacks
}
```

**Manifest** (`contracts/contribution-manifest.ts`):

```typescript
interface ContributionManifest {
  readonly modules?: readonly ModuleType[];
  readonly imports?: readonly ImportType[];
  readonly providers?: readonly ProviderType[];
  readonly exports?: readonly ExportType[];
  readonly controllers?: readonly ControllerType[];
  readonly middlewares?: readonly MiddlewareType[];
  readonly guards?: readonly GuardType[];
  readonly interceptors?: readonly InterceptorType[];
  readonly filters?: readonly FilterType[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
```

**Sources** (`resolver/sources/`):

| Source | Description |
|---|---|
| `ExplicitContributionSource` | Contributions explicitly provided by the application |
| `WorkspaceContributionSource` | Contributions from the current workspace (monorepo packages) |
| `PackageContributionSource` | Contributions from installed npm packages |
| `PluginContributionSource` | Dynamically loaded runtime plugins (currently empty — extension point) |

### Instrumentation

Instrumentation is configured via `InstrumentationOptions`:

```typescript
interface InstrumentationOptions {
  enabled?: boolean;
  environment?: string;
  version?: string;
  debug?: boolean;
  attributes?: Readonly<Record<string, unknown>>;
  console?: { enabled?: boolean };
  opentelemetry?: {
    enabled?: boolean;
    interval?: number;
    console?: boolean;
    otlp?: { enabled?: boolean; endpoint?: string };
  };
  prometheus?: { enabled?: boolean; port?: number };
  sentry?: {
    enabled?: boolean;
    dsn?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
    sendDefaultPii?: boolean;
  };
}
```

Each provider's `supports()` method determines whether it activates based on the options. Providers are initialized sequentially and shut down in reverse order.

### Server Runtime

The server subsystem is composed by `ServerBuilder`:

```
ServerBuilder
    │
    ├── ServerLifecycle        (state machine)
    ├── GracefulShutdown       (signal handling + ordered hooks)
    ├── ReadinessChecker       (can receive traffic?)
    ├── LivenessChecker        (process alive?)
    └── ApplicationServer      (public facade)
```

**Shutdown priority** (`server/shutdown/shutdown-priority.ts`):

| Priority | Value | Component |
|---|---|---|
| SERVER | 1000 | Stop accepting traffic |
| INSTRUMENTATION | 900 | Flush telemetry, traces, metrics, logs |
| APPLICATION | 700 | Shutdown application services |
| DATABASE | 500 | Close persistent data stores |
| CACHE | 400 | Disconnect cache providers |
| WORKERS | 300 | Stop background workers |
| DEFAULT | 0 | Default |

Higher values execute first. The shutdown is timeout-enforced (default 30s).

---

## Public API

The framework exports the following from `@solvia/core`:

### Entry Point

```typescript
bootstrapSolvia(options: ApplicationOptions): Promise<void>
```

Boots a Solvia application. Handles unrecoverable failures by logging and setting `process.exitCode = 1`.

### Bootstrap Loader

```typescript
BootstrapLoader.load(options?: BootstrapOptions): Promise<BootstrapRuntime>
BootstrapLoader.loadAsync(options: BootstrapOptions | Promise<BootstrapOptions>): Promise<BootstrapRuntime>
```

### Nest Integration

```typescript
BootstrapNestModule.forRoot(options?: BootstrapOptions): Promise<DynamicModule>
BootstrapNestModule.forRootAsync(options?: BootstrapOptions | Promise<BootstrapOptions>): Promise<DynamicModule>
```

### Enums

- `BootstrapProfile` — `API`, `CLI`, `WORKER`, `MICROSERVICE`, `TESTING`
- `BootstrapFeature` — `CONFIGURATION`, `DATABASE`, `CACHE`, `STORAGE`, `SEARCH`, `QUEUE`, `EVENTS`, `LOGGER`, `METRICS`, `TELEMETRY`, `DISCOVERY`, `PLUGINS`, `SCHEDULER`, `REST`, `GRAPHQL`, `WEBSOCKET`
- `BootstrapExecutionMode` — `SEQUENTIAL`, `PARALLEL`, `SCHEDULED`
- `ApplicationState`, `ServerState`, `InstrumentationState`, `ContributionStatus`, `ContributionManagerState`, `ShutdownState`, `HealthStatus`

### Contracts

- `ApplicationOptions`, `ApplicationRuntime`, `ApplicationHooks`, `RuntimeOptions`
- `BootstrapOptions`, `BootstrapContext`, `BootstrapRuntime`, `BootstrapPlan`, `BootstrapResult`
- `ServerOptions`, `ServerHealthOptions`, `ServerShutdownOptions`
- `KernelContribution`, `ContributionManifest`, `ContributionDefinition`, `ContributionHooks`
- `InstrumentationOptions`, `InstrumentationRuntime`, `InstrumentationProvider`
- `HealthReport`, `HealthIndicator`, `HealthStatus`

---

## Usage Guide

### Installation

```bash
# Install all workspace dependencies
npm install

# Build all workspaces
npm run build

# Type-check all workspaces
npm run typecheck
```

### Starting the API

The minimal application in `apps/api/src/main.ts`:

```typescript
import { bootstrapSolvia } from "@solvia/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  await bootstrapSolvia({
    module: AppModule,
  });
}

bootstrap();
```

Build and start:

```bash
# Build the core package first (required by the API)
npm run build --workspace @solvia/core

# Build the API
npm run build --workspace @solvia/api

# Start the API
npm start --workspace @solvia/api
# → node apps/api/dist/main.js
```

### Configuring the Application

`ApplicationOptions` (in `application/contracts/application.options.ts`) provides full control:

```typescript
import { bootstrapSolvia, BootstrapProfile, BootstrapFeature } from "@solvia/core";

await bootstrapSolvia({
  module: AppModule,

  // Identity
  name: "Solvia API",
  version: "1.0.0",
  environment: "production",

  // Server
  server: {
    host: "0.0.0.0",
    port: 3000,
    shutdown: { enabled: true, timeoutMs: 30_000 },
    health:   { enabled: true, readiness: true, liveness: true },
  },

  // Runtime behavior
  runtime: {
    bufferLogs: false,
    rawBody: false,    // required for Stripe/GitHub webhooks
    snapshot: false,
  },

  // Kernel bootstrap
  bootstrap: {
    profile: BootstrapProfile.API,
    features: [
      BootstrapFeature.DATABASE,
      BootstrapFeature.REST,
      BootstrapFeature.METRICS,
    ],
    imports: [],
    providers: [],
  },

  // Instrumentation
  instrumentation: {
    environment: "production",
    version: "1.0.0",
    console:       { enabled: true },
    opentelemetry: {
      enabled: true,
      interval: 10_000,
      otlp: { enabled: true, endpoint: "http://otel-collector:4318" },
    },
    prometheus: { enabled: true, port: 9464 },
    sentry: {
      enabled: true,
      dsn: "https://...@sentry.io/...",
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.3,
      sendDefaultPii: false,
    },
  },

  // Custom metadata
  metadata: { team: "platform", region: "eu-west" },
});
```

### Using the Kernel as a Nest Module

For direct NestJS integration without the full application bootstrap:

```typescript
import { Module } from "@nestjs/common";
import { BootstrapNestModule, BootstrapProfile } from "@solvia/core";

@Module({
  imports: [
    await BootstrapNestModule.forRoot({
      profile: BootstrapProfile.API,
    }),
  ],
})
export class AppModule {}
```

For asynchronous configuration (e.g., loading from a config service):

```typescript
@Module({
  imports: [
    await BootstrapNestModule.forRootAsync(
      Promise.resolve({ profile: BootstrapProfile.API }),
    ),
  ],
})
export class AppModule {}
```

### Creating a Contribution

Implement `KernelContribution` with a manifest and lifecycle hooks:

```typescript
import {
  type KernelContribution,
  type ContributionManifest,
  type ContributionHooks,
  type ContributionContext,
  type ContributionRuntime,
} from "@solvia/core";

class DatabaseService {
  async query(sql: string) { /* ... */ }
  async connect() { /* ... */ }
  async disconnect() { /* ... */ }
}

class DatabaseContribution implements KernelContribution {
  readonly name = "database";
  readonly version = "1.0.0";
  readonly description = "PostgreSQL database contribution";
  readonly dependencies: readonly string[] = [];

  readonly manifest: ContributionManifest = {
    providers: [DatabaseService],
    exports:   [DatabaseService],
  };

  readonly hooks: ContributionHooks = {
    beforeLoad: async (ctx: ContributionContext) => {
      // Validate configuration, prepare state
    },
    load: async (ctx: ContributionContext) => {
      // Initialize connection pool
    },
    afterLoad: async (ctx: ContributionContext) => {
      // Post-load cleanup
    },
    beforeStart: async (ctx: ContributionContext) => {
      // Pre-activation checks
    },
    start: async (rt: ContributionRuntime) => {
      // Connect to database
    },
    ready: async (rt: ContributionRuntime) => {
      // Kernel is fully ready
    },
    stop: async (rt: ContributionRuntime) => {
      // Disconnect
    },
    destroy: async (ctx: ContributionContext) => {
      // Final cleanup
    },
    error: async (error: Error, ctx: ContributionContext) => {
      // Error notification (never interrupts lifecycle)
    },
  };
}
```

Register the contribution via one of the four sources (`explicit`, `workspace`, `packages`, `plugins`).

### Instrumentation Configuration

Each provider activates based on its `supports()` method:

| Provider | Activates when |
|---|---|
| `ConsoleProvider` | `options.console.enabled === true` |
| `OpenTelemetryProvider` | `options.opentelemetry.enabled === true` (requires at least one reader: OTLP or console) |
| `PrometheusProvider` | `options.prometheus.enabled === true` |
| `SentryProvider` | `options.sentry.enabled === true && options.sentry.dsn` |

Providers are initialized in order: Console → OpenTelemetry → Prometheus → Sentry. Shut down in reverse order.

---

## Testing

The framework has comprehensive Jest test suites organized by subsystem.

### Root commands

```bash
npm test                    # Run all workspace tests
```

### Core package commands

```bash
# Run all tests
npm test --workspace @solvia/core

# Run by subsystem
npm run test:application          --workspace @solvia/core
npm run test:instrumentation      --workspace @solvia/core
npm run test:contributions        --workspace @solvia/core
npm run test:resolver             --workspace @solvia/core
npm run test:registry              --workspace @solvia/core
npm run test:lifecycle             --workspace @solvia/core
npm run test:loader                --workspace @solvia/core
npm run test:validator             --workspace @solvia/core
npm run test:normalization         --workspace @solvia/core
npm run test:bootstrap             --workspace @solvia/core
npm run test:pipeline              --workspace @solvia/core

# Integration & E2E
npm run test:integration           --workspace @solvia/core
npm run test:e2e                   --workspace @solvia/core

# Coverage
npm run test:coverage              --workspace @solvia/core

# Watch mode
npm run test:watch                 --workspace @solvia/core
```

### Test organization

```
packages/core/src/
├── __tests__/
│   ├── integration/          # Kernel bootstrap integration
│   └── e2e/                   # Application startup end-to-end
├── application/__tests__/     # Application layer tests
├── instrumentation/__tests__/ # Instrumentation tests
└── kernel/
    ├── bootstrap/__tests__/  # Bootstrap pipeline tests
    ├── bootstrap/pipeline/__tests__/
    └── contributions/
        ├── lifecycle/__tests__/
        ├── loader/__tests__/
        ├── normalization/__tests__/
        ├── registry/__tests__/
        ├── resolver/__tests__/
        └── validator/__tests__/
```

### Jest configuration

- **Environment**: `node`
- **Transformer**: `ts-jest` with project `tsconfig.json`
- **Test match**: `src/**/*.spec.ts`, `src/**/*.test.ts`
- **Module alias**: `src/*` → `<rootDir>/src/*`
- **Mocks**: `clearMocks: true`, `restoreMocks: true`
- **Coverage**: excludes `*.module.ts`, `*.dto.ts`

---

## Design Principles

### 1. Immutability

All runtime artifacts are frozen at construction:

```typescript
return Object.freeze({
  id: this.id,
  name: this.name,
  // ...
});
```

This guarantees that once a runtime is produced, it cannot be mutated. Consumers receive a stable, shareable reference.

### 2. Single Responsibility

Each class has exactly one role:

- **Builders** build objects (e.g., `BootstrapBuilder`, `RuntimeBuilder`)
- **Validators** validate objects (e.g., `BootstrapValidator`, `ContributionValidator`)
- **Executors** execute objects (e.g., `BootstrapExecutor`, `PipelineExecutor`)
- **Engines** orchestrate (e.g., `BootstrapEngine`, `PipelineEngine`, `RegistryEngine`)
- **Factories** create objects (e.g., `ApplicationFactory`, `ContributionFactory`)
- **Adapters** translate between models (e.g., `NestRuntimeAdapter`)
- **Loaders** are public entry points (e.g., `BootstrapLoader`)

### 3. Framework-Agnostic Kernel

The kernel never imports NestJS. The `adapters/nest/` layer translates the kernel's immutable runtime artifacts into NestJS `DynamicModule` metadata:

```
BootstrapRuntime → NestRuntimeAdapter → NestRuntimeMetadata → DynamicModuleBuilder → DynamicModule
```

### 4. Deterministic Ordering

- Bootstrap phases are ordered by `phase.order` (then by name as tie-breaker).
- Contributions are topologically sorted by dependencies, then alphabetically by name.
- Duplicate phases and orders are rejected.
- Dependency cycles are detected and reported with a diagnostic chain.

### 5. Explicit Extension Points

Many components declare explicit extension points for future capabilities:

- `ApplicationConfigurator` — configuration steps (logging, validation, security, etc.)
- `DiscoveryEngine` — discovery strategies (filesystem, metadata, plugin)
- `RegistryEngine` — registry strategies (controller, guard, interceptor, filter)
- `PluginContributionSource` — runtime plugin discovery
- `InitializeAction` — runtime metadata, diagnostics, telemetry, kernel services
- `InstrumentationRuntimeBuilder` — capabilities, timeline

These are marked with `// Future:` comments in the source.

### 6. Graceful Degradation

- Lifecycle `error` hooks never interrupt the lifecycle.
- Rollback on `start` failure is best-effort and never throws.
- Graceful shutdown is idempotent and timeout-enforced.

### 7. Defensive Boundaries

- `BootstrapValidator` is the safety boundary between planning and execution.
- `PipelineValidator` is the last safety boundary before runtime execution.
- `DependencyValidator` validates graph integrity before resolution.
- `DependencyCycleDetector` prevents circular dependencies.
- `ContributionValidator` rejects invalid contributions before registration.

---

## Extension Points

The framework is designed for extension. Key extension points:

| Extension Point | Location | Purpose |
|---|---|---|
| Configuration steps | `ApplicationConfigurator.resolveSteps()` | Add logging, validation, security, HTTP, telemetry configurators |
| Discovery strategies | `DiscoveryEngine.resolve()` | Add filesystem, metadata, plugin discovery |
| Registry strategies | `RegistryEngine.resolve()` | Add controller, guard, interceptor, filter registries |
| Contribution sources | `ContributionSourceResolver.SOURCES` | Add custom contribution discovery sources |
| Instrumentation providers | `InstrumentationEngine.resolveProviders()` | Add custom telemetry providers |
| Shutdown hooks | `ApplicationServer.registerShutdownHook()` | Add infrastructure shutdown participants |
| Health indicators | `ReadinessChecker.add()` / `LivenessChecker.add()` | Add database, cache, queue health checks |
| Bootstrap actions | `BootstrapActionRegistry.register()` | Add custom bootstrap phases |

---

## Glossary

| Term | Definition |
|---|---|
| **Application** | The final user-facing service (e.g., `apps/api`). |
| **ApplicationBootstrap** | The orchestrator that starts the entire application lifecycle. |
| **ApplicationRuntime** | The immutable, frozen runtime artifact produced at the end of bootstrap. |
| **ApplicationContext** | The mutable state container that evolves during application execution. |
| **Bootstrap** | The process of starting the kernel (resolving contributions, discovery, registry, pipeline, runtime). |
| **BootstrapRuntime** | The immutable kernel runtime produced after bootstrap completion. |
| **Contribution** | A declarative capability that extends the kernel (a plugin). |
| **ContributionManifest** | The declarative description of infrastructure exposed by a contribution. |
| **ContributionRuntime** | The immutable runtime representation of a single loaded contribution. |
| **ContributionManagerRuntime** | The immutable facade exposing all loaded contributions. |
| **Discovery** | The phase that discovers modules, providers, controllers, etc. |
| **Registry** | The phase that normalizes discovered artifacts into an immutable snapshot. |
| **Pipeline** | The internal execution engine for bootstrap phases. |
| **Instrumentation** | The telemetry subsystem (OpenTelemetry, Prometheus, Sentry, Console). |
| **InstrumentationRuntime** | The immutable instrumentation runtime produced after provider initialization. |
| **ServerLifecycle** | The state machine tracking server state (CREATED → STARTING → RUNNING → ...). |
| **GracefulShutdown** | The coordinator that handles OS signals and ordered shutdown hooks. |
| **Readiness** | "Can this server safely receive traffic?" — requires RUNNING state. |
| **Liveness** | "Should this process continue running?" — fails on STOPPED/FAILED. |
| **ShutdownHook** | A participant in graceful shutdown (server, instrumentation, database, etc.). |
| **ShutdownPriority** | The execution order of shutdown hooks (higher = first). |
| **BootstrapPhase** | An immutable stage of the bootstrap lifecycle (name + order). |
| **BootstrapAction** | The executable logic associated with a phase. |
| **BootstrapPlan** | The immutable compiled execution graph of phases. |
| **DependencyGraph** | The immutable directed graph of contribution dependencies. |
| **TopologicalSorter** | The algorithm that resolves dependency-safe execution order. |

---

## License

Private. © Solvia. All rights reserved.

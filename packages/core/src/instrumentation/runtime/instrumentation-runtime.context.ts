import { randomUUID } from "node:crypto";

import { InstrumentationContext } from "../contracts/instrumentation-context";
import { InstrumentationOptions } from "../contracts/instrumentation-options";
import { InstrumentationProvider } from "../contracts/instrumentation-provider";

/* =============================================================================
 * Instrumentation Runtime Context
 * =============================================================================
 *
 * Mutable execution context used during instrumentation bootstrap.
 *
 * Owns:
 *
 * • Session identity
 * • Startup configuration
 * • Provider lifecycle tracking
 * • Runtime metadata
 * • Failure tracking
 *
 * This object lives only during bootstrap.
 *
 * The final immutable representation is produced by
 * InstrumentationRuntimeBuilder.
 *
 * =============================================================================
 */

export class InstrumentationRuntimeContext implements InstrumentationContext {
  /**
   * Unique instrumentation session identifier.
   */
  public readonly id: string;

  /**
   * Bootstrap start timestamp.
   */
  public readonly startedAt: Date;

  /**
   * Immutable configuration snapshot.
   */
  public readonly options: Readonly<InstrumentationOptions>;

  /**
   * Execution environment.
   */
  public readonly environment: string;

  /**
   * Diagnostic mode.
   */
  public readonly debug: boolean;

  /**
   * Global instrumentation attributes.
   */
  public readonly attributes: Readonly<Record<string, unknown>>;

  private readonly initializedProviders = new Set<InstrumentationProvider>();

  private readonly failures = new Map<InstrumentationProvider, Error>();

  private readonly metadata = new Map<string, unknown>();

  private ready = false;

  private bootstrapError?: Error;

  private constructor(options: InstrumentationOptions) {
    this.id = randomUUID();

    this.startedAt = new Date();

    this.options = Object.freeze(structuredClone(options));

    this.environment = options.environment ?? "production";

    this.debug = options.debug ?? false;

    this.attributes = Object.freeze({
      "service.name": options.attributes?.["service.name"] ?? "solvia",

      "runtime.name": "node",

      ...options.attributes,
    });
  }

  /**
   * Creates a new instrumentation session.
   */
  public static create(
    options: InstrumentationOptions = {},
  ): InstrumentationRuntimeContext {
    return new InstrumentationRuntimeContext(options);
  }

  /**
   * Registers successful provider initialization.
   */
  public markInitialized(provider: InstrumentationProvider): void {
    this.initializedProviders.add(provider);
  }

  /**
   * Marks bootstrap completion.
   */
  public markReady(): void {
    this.ready = true;
  }

  /**
   * Records provider failure.
   */
  public markFailed(provider: InstrumentationProvider, error: Error): void {
    this.failures.set(provider, error);
  }

  /**
   * Records global bootstrap failure.
   */
  public markBootstrapFailed(error: Error): void {
    this.bootstrapError = error;
  }

  /**
   * Adds runtime metadata.
   */
  public setMetadata(key: string, value: unknown): void {
    this.metadata.set(key, value);
  }

  /**
   * Reads runtime metadata.
   */
  public getMetadata<T = unknown>(key: string): T | undefined {
    return this.metadata.get(key) as T | undefined;
  }

  public registerProvider(provider: InstrumentationProvider): void {
    this.initializedProviders.add(provider);
  }

  /**
   * Initialized providers snapshot.
   */
  public get providers(): readonly InstrumentationProvider[] {
    return [...this.initializedProviders];
  }

  /**
   * Provider failure snapshot.
   */
  public get failuresSnapshot(): ReadonlyMap<InstrumentationProvider, Error> {
    return new Map(this.failures);
  }

  /**
   * Runtime metadata snapshot.
   */
  public get metadataSnapshot(): ReadonlyMap<string, unknown> {
    return new Map(this.metadata);
  }

  /**
   * Indicates successful provider initialization.
   */
  public get healthy(): boolean {
    return this.failures.size === 0 && !this.bootstrapError;
  }

  /**
   * Indicates completed bootstrap.
   */
  public get isReady(): boolean {
    return this.ready;
  }

  /**
   * Returns bootstrap failure.
   */
  public get bootstrapFailure(): Error | undefined {
    return this.bootstrapError;
  }
}

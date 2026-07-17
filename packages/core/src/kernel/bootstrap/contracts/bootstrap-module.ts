import type { ModuleType } from "../types/module.type";

/* =============================================================================
 * Bootstrap Module
 * =============================================================================
 *
 * Immutable Kernel representation of a discovered Nest module.
 *
 * A BootstrapModule is not a Nest runtime module.
 *
 * It is a Kernel-owned descriptor created during discovery and consumed during
 * registry construction.
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Describe a Nest module participating in bootstrap
 * • Preserve discovery information
 * • Maintain module identity
 * • Track module origin
 * • Define bootstrap ordering
 * • Provide metadata for diagnostics and tooling
 *
 * Lifecycle:
 *
 * Discovery
 *      |
 *      v
 * BootstrapModule
 *      |
 *      v
 * ModuleRegistry
 *      |
 *      v
 * RegistrySnapshot
 *      |
 *      v
 * Nest DynamicModule
 *
 * The Kernel owns this abstraction.
 * Nest only receives the final normalized module references.
 *
 * =============================================================================
 */

export interface BootstrapModule {
  /**
   * Runtime module reference.
   *
   * Framework independent representation.
   */
  readonly module: ModuleType;

  /**
   * ---------------------------------------------------------------------------
   * Stable module identity.
   *
   * Must remain unique inside the Kernel module graph.
   *
   * Used for:
   *
   * • diagnostics
   * • duplicate detection
   * • dependency resolution
   *
   * Example:
   *
   * "core"
   * "database"
   * "authentication"
   *
   * ---------------------------------------------------------------------------
   */
  readonly name: string;

  /**
   * ---------------------------------------------------------------------------
   * Semantic module version.
   *
   * Used for compatibility checks and tooling.
   *
   * ---------------------------------------------------------------------------
   */
  readonly version?: string;

  /**
   * ---------------------------------------------------------------------------
   * Discovery origin.
   *
   * Indicates where this module was discovered.
   *
   * Examples:
   *
   * "kernel"
   * "database-contribution"
   * "plugin:mysql"
   *
   * ---------------------------------------------------------------------------
   */
  readonly source: string;

  /**
   * ---------------------------------------------------------------------------
   * Bootstrap execution priority.
   *
   * Lower values are processed first.
   *
   * ---------------------------------------------------------------------------
   */
  readonly order: number;

  /**
   * ---------------------------------------------------------------------------
   * Module dependency declarations.
   *
   * Reserved for future dependency graph resolution.
   *
   * Example:
   *
   * ["configuration", "database"]
   *
   * ---------------------------------------------------------------------------
   */
  readonly dependencies?: readonly string[];

  /**
   * ---------------------------------------------------------------------------
   * Indicates whether this module should become global in Nest.
   *
   * Used by the Nest adapter layer.
   *
   * ---------------------------------------------------------------------------
   */
  readonly global?: boolean;

  /**
   * ---------------------------------------------------------------------------
   * Immutable module metadata.
   *
   * Reserved for:
   *
   * • diagnostics
   * • instrumentation
   * • telemetry
   * • profiling
   * • developer tooling
   *
   * ---------------------------------------------------------------------------
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

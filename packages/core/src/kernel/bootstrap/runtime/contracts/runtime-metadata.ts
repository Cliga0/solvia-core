/* =============================================================================
 * Runtime Metadata Contract
 * =============================================================================
 *
 * Immutable metadata attached to a Kernel runtime.
 *
 * RuntimeMetadata is a framework-independent metadata container used by the
 * bootstrap runtime to expose additional information.
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Store runtime descriptive information
 * • Preserve bootstrap diagnostics
 * • Expose extension metadata
 * • Support tooling and instrumentation
 *
 *
 * Does NOT:
 *
 * • Describe framework modules
 * • Configure NestJS
 * • Configure adapters
 * • Control runtime behavior
 *
 *
 * Framework-specific metadata belongs to adapters.
 *
 * Example:
 *
 * Kernel Runtime
 *       |
 *       v
 * RuntimeMetadata
 *
 *
 * Nest Adapter
 *       |
 *       v
 * NestRuntimeMetadata
 *
 * =============================================================================
 */

/* =============================================================================
 * Runtime Metadata
 * =============================================================================
 *
 * Immutable metadata bag owned by the Kernel runtime.
 *
 * =============================================================================
 */

export type RuntimeMetadata = Readonly<Record<string, unknown>>;

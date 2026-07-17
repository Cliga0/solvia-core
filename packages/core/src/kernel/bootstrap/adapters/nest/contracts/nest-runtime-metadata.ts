/* =============================================================================
 * Nest Runtime Metadata Contract
 * =============================================================================
 *
 * Immutable runtime composition metadata produced by the Nest adapter layer.
 *
 * This contract represents the translation boundary between the Solvia Kernel
 * runtime model and the NestJS execution model.
 *
 *
 * Architecture
 * ---------------------------------------------------------------------------
 *
 *        BootstrapRuntime
 *              |
 *              v
 *      NestRuntimeAdapter
 *              |
 *              v
 *   NestRuntimeMetadata
 *              |
 *              v
 *       DynamicModule
 *
 *
 * Responsibilities
 * ---------------------------------------------------------------------------
 *
 * • Describe Nest runtime composition
 * • Expose translated Kernel artifacts
 * • Preserve framework isolation boundaries
 * • Provide immutable adapter output
 *
 *
 * Does NOT:
 *
 * • Execute bootstrap lifecycle
 * • Resolve contributions
 * • Discover modules
 * • Instantiate providers
 * • Manage dependency injection
 *
 * =============================================================================
 */

import type { ModuleType } from "../../../types/module.type";
import type { ProviderType } from "../../../types/provider.type";
import type { ControllerType } from "../../../types/controller.type";
import type { ExportType } from "../../../types/export.type";

/* =============================================================================
 * Nest Adapter Metadata
 * =============================================================================
 *
 * Immutable description of a Nest runtime module composition.
 *
 * Generated exclusively by NestRuntimeAdapter.
 *
 * =============================================================================
 */

export interface NestRuntimeMetadata {
  /* ===========================================================================
   * Adapter Identity
   * ========================================================================= */

  /**
   * Adapter identifier.
   *
   * Example:
   *
   * "nestjs"
   */
  readonly adapter: "nestjs";

  /* ===========================================================================
   * Module Composition
   * ========================================================================= */

  /**
   * Modules imported into the Nest runtime.
   *
   * Sources:
   *
   * - Kernel modules
   * - Contribution modules
   * - Plugin modules
   * - Feature modules
   */
  readonly imports: readonly ModuleType[];

  /* ===========================================================================
   * Dependency Injection
   * ========================================================================= */

  /**
   * Providers registered into the Nest container.
   *
   * Sources:
   *
   * - Kernel services
   * - Contribution providers
   * - Adapter services
   */
  readonly providers: readonly ProviderType[];

  /* ===========================================================================
   * Transport Layer
   * ========================================================================= */

  /**
   * Controllers exposed by the runtime.
   *
   * Sources:
   *
   * - HTTP controllers
   * - GraphQL controllers
   * - Plugin controllers
   */
  readonly controllers: readonly ControllerType[];

  /* ===========================================================================
   * Public API
   * ========================================================================= */

  /**
   * Runtime capabilities exported from the Nest module.
   *
   * Sources:
   *
   * - Providers
   * - Services
   * - Extension points
   */
  readonly exports: readonly ExportType[];

  /* ===========================================================================
   * Extension Metadata
   * ========================================================================= */

  /**
   * Adapter-specific metadata.
   *
   * Never interpreted by the Kernel.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

import type { ContributionManifest } from "./contribution-manifest";
import type { ContributionHooks } from "../lifecycle/contribution.hooks";

/* =============================================================================
 * Kernel Contribution
 * =============================================================================
 *
 * Root contract of the Solvia Kernel contribution model.
 *
 * A KernelContribution describes an autonomous capability that can extend the
 * Solvia Kernel.
 *
 * A contribution is entirely declarative. It defines:
 *
 * • its identity
 * • its dependencies
 * • the infrastructure it contributes
 * • its lifecycle callbacks
 *
 * The Kernel owns discovery, loading, orchestration and execution.
 *
 * A contribution never manages its own lifecycle.
 *
 * =============================================================================
 */

export interface KernelContribution {
  /* ===========================================================================
   * Identity
   * ========================================================================= */

  /**
   * Stable contribution identifier.
   *
   * Examples:
   *
   * auth
   * database
   * cache
   * metrics
   */
  readonly name: string;

  /**
   * Optional semantic version.
   */
  readonly version?: string;

  /**
   * Human-readable description.
   */
  readonly description?: string;

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  /**
   * Other contributions that must be loaded before this one.
   */
  readonly dependencies?: readonly string[];

  /* ===========================================================================
   * Manifest
   * ========================================================================= */

  /**
   * Declarative infrastructure exposed by this contribution.
   *
   * The manifest represents everything contributed to the Kernel
   * (providers, imports, controllers, middleware, guards, exports, etc.).
   */
  readonly manifest: ContributionManifest;

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  /**
   * Optional contribution metadata.
   *
   * Reserved for diagnostics, tooling and future Kernel extensions.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;

  /* ===========================================================================
   * Lifecycle
   * ========================================================================= */

  /**
   * Optional lifecycle hooks.
   */
  readonly hooks?: ContributionHooks;
}
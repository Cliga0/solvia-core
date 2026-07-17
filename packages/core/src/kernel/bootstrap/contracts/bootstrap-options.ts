import type { ImportType } from "../types/import.type";
import type { ProviderType } from "../types/provider.type";

import { BootstrapFeature } from "../enums/bootstrap-feature.enum";
import { BootstrapProfile } from "../enums/bootstrap-profile.enum";

/* =============================================================================
 * Bootstrap Options
 * =============================================================================
 *
 * Declarative configuration contract used by the Bootstrap Engine.
 *
 * BootstrapOptions defines the desired runtime composition.
 *
 * It describes:
 *
 * • Runtime profile
 * • Enabled kernel capabilities
 * • Application extensions
 * • Infrastructure configuration
 *
 * It never controls the bootstrap algorithm itself.
 *
 * The Bootstrap Engine owns execution.
 *
 * =============================================================================
 */

export interface BootstrapOptions {
  /**
   * Runtime execution profile.
   *
   * Controls the global bootstrap strategy.
   *
   * Default:
   * API
   */
  readonly profile?: BootstrapProfile;

  /**
   * Enabled kernel features.
   *
   * Examples:
   *
   * - discovery
   * - registry
   * - pipeline
   * - instrumentation
   */
  readonly features?: readonly BootstrapFeature[];

  /**
   * Additional Nest application modules.
   *
   * Used by the Nest adapter layer.
   */
  readonly imports?: readonly ImportType[];

  /**
   * Additional dependency providers.
   *
   * Used for runtime extension.
   */
  readonly providers?: readonly ProviderType[];

  /**
   * Optional Nest module metadata.
   *
   * This metadata is consumed only by
   * the Nest bootstrap adapter.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

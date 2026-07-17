import type { INestApplication } from "@nestjs/common";

/* =============================================================================
 * Application Configuration Step
 * =============================================================================
 *
 * One deterministic configuration stage executed during application startup.
 *
 * =============================================================================
 */

export interface ApplicationConfigurationStep {
  /**
   * Step identifier.
   */
  readonly name: string;

  /**
   * Execution priority.
   */
  readonly order: number;

  /**
   * Applies configuration to Nest application.
   */
  configure(application: INestApplication): Promise<void> | void;
}

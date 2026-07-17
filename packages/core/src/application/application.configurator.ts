import { INestApplication } from "@nestjs/common";

import { ApplicationOptions } from "./contracts/application.options";

import type { ApplicationConfigurationStep } from "./configuration/application-configuration-step";

/* =============================================================================
 * Application Configurator
 * =============================================================================
 *
 * Responsible for transforming a raw Nest application into a production-ready
 * application runtime.
 *
 *
 * Lifecycle position:
 *
 *
 * ApplicationFactory
 *          |
 *          v
 *    INestApplication
 *          |
 *          v
 * ApplicationConfigurator
 *          |
 *          v
 * Production Application
 *
 *
 * Responsibilities:
 *
 * - Execute application configuration pipeline
 * - Order configuration steps
 * - Handle configuration failures
 * - Provide extension points
 *
 *
 * Does NOT:
 *
 * - create Nest application
 * - start HTTP server
 * - contain business logic
 *
 * =============================================================================
 */

export class ApplicationConfigurator {
  private readonly steps: ApplicationConfigurationStep[];

  private constructor(private readonly options: ApplicationOptions) {
    this.steps = this.resolveSteps();
  }

  /**
   * Factory
   */
  public static create(options: ApplicationOptions): ApplicationConfigurator {
    return new ApplicationConfigurator(options);
  }

  /**
   * Main configuration entry point.
   */
  public async configure(application: INestApplication): Promise<void> {
    const orderedSteps = this.sortSteps();

    for (const step of orderedSteps) {
      await this.executeStep(step, application);
    }
  }

  /**
   * Resolve available configuration modules.
   *
   * Future:
   *
   * - dependency injection
   * - plugins
   * - environment based steps
   */
  private resolveSteps(): ApplicationConfigurationStep[] {
    return [
      // LoggingConfigurator
      // ExceptionConfigurator
      // ValidationConfigurator
      // HttpConfigurator
      // SecurityConfigurator
      // TelemetryConfigurator
    ];
  }

  /**
   * Execute one configuration step.
   */
  private async executeStep(
    step: ApplicationConfigurationStep,
    application: INestApplication,
  ): Promise<void> {
    try {
      await step.configure(application);
    } catch (error) {
      throw new Error(`Application configuration failed at "${step.name}".`, {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Deterministic execution order.
   */
  private sortSteps(): ApplicationConfigurationStep[] {
    return [...this.steps].sort((a, b) => a.order - b.order);
  }
}

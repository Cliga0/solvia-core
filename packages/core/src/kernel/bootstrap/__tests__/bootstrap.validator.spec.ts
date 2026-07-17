import { BootstrapValidator } from "../bootstrap.validator";

import type { BootstrapPlan, BootstrapStep } from "../contracts/bootstrap-plan";
import type { BootstrapAction } from "../contracts/bootstrap-action";
import type { BootstrapPhase } from "../contracts/bootstrap-phase";

/* =============================================================================
 * Bootstrap Validator Tests
 * =============================================================================
 *
 * Contract tests for bootstrap plan integrity validation.
 *
 * These tests verify that BootstrapValidator:
 *
 * • accepts valid bootstrap plans
 * • rejects corrupted plans
 * • protects execution boundaries
 * • validates ordering and dependencies
 *
 * =============================================================================
 */

describe("BootstrapValidator", () => {
  /* ===========================================================================
   * Test factories
   * ========================================================================= */

  const createPhase = (name = "database", order = 1): BootstrapPhase =>
    ({
      name,
      order,
    }) as BootstrapPhase;

  const createAction = (
    phase: BootstrapPhase = createPhase(),
  ): BootstrapAction =>
    ({
      phase,

      execute: jest.fn(),
    }) as BootstrapAction;

  const createStep = (
    overrides: Partial<BootstrapStep> = {},
  ): BootstrapStep => {
    const phase = Object.prototype.hasOwnProperty.call(overrides, "phase")
      ? overrides.phase
      : createPhase();

    const action = Object.prototype.hasOwnProperty.call(overrides, "action")
      ? overrides.action
      : createAction(phase as BootstrapPhase);

    return {
      phase,

      action,

      dependencies: overrides.dependencies ?? [],

      metadata: overrides.metadata ?? {},
    } as BootstrapStep;
  };

  const createPlan = (
    overrides: Partial<BootstrapPlan> = {},
  ): BootstrapPlan => {
    const hasStepsOverride = Object.prototype.hasOwnProperty.call(
      overrides,
      "steps",
    );

    const steps = hasStepsOverride ? overrides.steps : [createStep()];

    const count = Object.prototype.hasOwnProperty.call(overrides, "count")
      ? overrides.count
      : Array.isArray(steps)
        ? steps.length
        : 0;

    return {
      id: overrides.id ?? "bootstrap-test",

      version: overrides.version ?? 1,

      steps,

      count,

      createdAt: overrides.createdAt ?? new Date(),

      metadata: overrides.metadata ?? {
        source: "test",
      },
    } as BootstrapPlan;
  };

  /* ===========================================================================
   * Basic validation
   * ========================================================================= */

  describe("validate", () => {
    it("should validate a complete bootstrap plan", () => {
      expect(() => BootstrapValidator.validate(createPlan())).not.toThrow();
    });

    it("should reject undefined plan", () => {
      expect(() =>
        BootstrapValidator.validate(undefined as unknown as BootstrapPlan),
      ).toThrow("Bootstrap plan is required.");
    });

    it("should reject null plan", () => {
      expect(() =>
        BootstrapValidator.validate(null as unknown as BootstrapPlan),
      ).toThrow("Bootstrap plan is required.");
    });
  });

  /* ===========================================================================
   * Plan integrity
   * ========================================================================= */

  describe("plan integrity", () => {
    it("should reject invalid steps collection", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: null as never,
          }),
        ),
      ).toThrow("Bootstrap plan steps must be an array.");
    });

    it("should reject count mismatch", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            count: 999,
          }),
        ),
      ).toThrow("Bootstrap plan count mismatch.");
    });

    it("should reject empty plans", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [],
          }),
        ),
      ).toThrow("Bootstrap plan cannot contain zero steps.");
    });
  });

  /* ===========================================================================
   * Identity validation
   * ========================================================================= */

  describe("identity validation", () => {
    it("should reject missing identifier", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            id: "",
          }),
        ),
      ).toThrow("Bootstrap plan requires an identifier.");
    });

    it("should reject invalid version", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            version: 0,
          }),
        ),
      ).toThrow("Bootstrap plan version is invalid.");
    });

    it("should reject invalid creation date", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            createdAt: new Date("invalid"),
          }),
        ),
      ).toThrow("Bootstrap plan creation date is corrupted.");
    });
  });

  /* ===========================================================================
   * Step validation
   * ========================================================================= */

  describe("steps", () => {
    it("should reject missing phase", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              createStep({
                phase: null as never,
              }),
            ],
          }),
        ),
      ).toThrow("Bootstrap step requires a phase.");
    });

    it("should reject missing action", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              createStep({
                action: null as never,
              }),
            ],
          }),
        ),
      ).toThrow("has no associated action");
    });

    it("should reject phase/action mismatch", () => {
      const phase = createPhase("database", 1);

      const action = createAction(createPhase("cache", 2));

      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              {
                phase,

                action,

                dependencies: [],

                metadata: {},
              },
            ],
          }),
        ),
      ).toThrow("Bootstrap action phase mismatch");
    });

    it("should reject invalid execute implementation", () => {
      const phase = createPhase();

      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              {
                phase,

                action: {
                  phase,

                  execute: null,
                } as never,

                dependencies: [],

                metadata: {},
              },
            ],
          }),
        ),
      ).toThrow("must implement execute()");
    });
  });

  /* ===========================================================================
   * Ordering
   * ========================================================================= */

  describe("ordering", () => {
    it("should reject unordered phases", () => {
      const steps = [
        createStep({
          phase: createPhase("application", 20),
        }),

        createStep({
          phase: createPhase("database", 10),
        }),
      ];

      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps,
          }),
        ),
      ).toThrow("Bootstrap phases are not ordered deterministically.");
    });
  });

  /* ===========================================================================
   * Duplicate phases
   * ========================================================================= */

  describe("duplicates", () => {
    it("should reject duplicate phases", () => {
      const phase = createPhase();

      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              createStep({
                phase,
              }),

              createStep({
                phase,
              }),
            ],
          }),
        ),
      ).toThrow('Duplicate bootstrap phase detected: "database".');
    });
  });

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  describe("dependencies", () => {
    it("should allow existing dependencies", () => {
      const database = createPhase("database", 1);

      const application = createPhase("application", 2);

      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              createStep({
                phase: database,
              }),

              createStep({
                phase: application,

                dependencies: ["database"],
              }),
            ],
          }),
        ),
      ).not.toThrow();
    });

    it("should reject missing dependencies", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            steps: [
              createStep({
                dependencies: ["missing-phase"],
              }),
            ],
          }),
        ),
      ).toThrow(
        'Bootstrap phase "database" depends on missing phase "missing-phase".',
      );
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata", () => {
    it("should accept object metadata", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            metadata: {
              environment: "test",
            },
          }),
        ),
      ).not.toThrow();
    });

    it("should reject primitive metadata", () => {
      expect(() =>
        BootstrapValidator.validate(
          createPlan({
            metadata: "invalid" as never,
          }),
        ),
      ).toThrow("Bootstrap metadata must be an object.");
    });
  });
});

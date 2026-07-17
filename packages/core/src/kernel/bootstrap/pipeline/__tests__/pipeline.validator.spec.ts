import { PipelineValidator } from "../pipeline.validator";

import type { ExecutionPlan } from "../contracts/execution-plan";

/* =============================================================================
 * Pipeline Validator Tests
 * =============================================================================
 *
 * Contract tests for bootstrap execution plan validation.
 *
 * PipelineValidator is the final safety boundary before execution.
 *
 * =============================================================================
 */

describe("PipelineValidator", () => {
  const validator = new PipelineValidator();

  const createPlan = (overrides: Partial<ExecutionPlan> = {}): ExecutionPlan =>
    ({
      id: "bootstrap-plan",

      createdAt: new Date(),

      size: 2,

      phases: [
        {
          name: "initialize",

          order: 0,
        },

        {
          name: "runtime",

          order: 1,
        },
      ],

      ...overrides,
    }) as ExecutionPlan;

  /* ===========================================================================
   * Valid plans
   * ========================================================================= */

  describe("valid execution plans", () => {
    it("should accept a valid execution plan", () => {
      expect(() => validator.validate(createPlan())).not.toThrow();
    });

    it("should accept deterministically ordered phases", () => {
      const plan = createPlan({
        phases: [
          {
            name: "a",
            order: 0,
          },

          {
            name: "b",
            order: 1,
          },

          {
            name: "c",
            order: 2,
          },
        ],

        size: 3,
      });

      expect(() => validator.validate(plan)).not.toThrow();
    });
  });

  /* ===========================================================================
   * Identity validation
   * ========================================================================= */

  describe("plan identity validation", () => {
    it("should reject missing plan identifier", () => {
      const plan = createPlan({
        id: "",
      });

      expect(() => validator.validate(plan)).toThrow(
        "Execution plan requires a valid identifier.",
      );
    });

    it("should reject invalid creation timestamp", () => {
      const plan = createPlan({
        createdAt: undefined as never,
      });

      expect(() => validator.validate(plan)).toThrow(
        "Execution plan requires a valid creation timestamp.",
      );
    });
  });

  /* ===========================================================================
   * Empty plan validation
   * ========================================================================= */

  describe("empty execution plans", () => {
    it("should reject empty phase collection", () => {
      const plan = createPlan({
        phases: [],

        size: 0,
      });

      expect(() => validator.validate(plan)).toThrow(
        "Execution plan contains no executable phases.",
      );
    });

    it("should reject inconsistent size", () => {
      const plan = createPlan({
        size: 5,
      });

      expect(() => validator.validate(plan)).toThrow(
        "Execution plan size does not match phase count.",
      );
    });
  });

  /* ===========================================================================
   * Phase name validation
   * ========================================================================= */

  describe("phase name validation", () => {
    it("should reject empty phase name", () => {
      const plan = createPlan({
        phases: [
          {
            name: "",
            order: 0,
          },
        ],

        size: 1,
      });

      expect(() => validator.validate(plan)).toThrow(
        "Bootstrap phase requires a name.",
      );
    });

    it("should reject duplicated phase names", () => {
      const plan = createPlan({
        phases: [
          {
            name: "initialize",
            order: 0,
          },

          {
            name: "initialize",
            order: 1,
          },
        ],

        size: 2,
      });

      expect(() => validator.validate(plan)).toThrow(
        'Duplicate bootstrap phase "initialize".',
      );
    });
  });

  /* ===========================================================================
   * Order validation
   * ========================================================================= */

  describe("phase ordering validation", () => {
    it("should reject non integer phase order", () => {
      const plan = createPlan({
        phases: [
          {
            name: "initialize",
            order: 0.5,
          },
        ],

        size: 1,
      });

      expect(() => validator.validate(plan)).toThrow(
        'Bootstrap phase "initialize" has invalid order "0.5".',
      );
    });

    it("should reject negative phase order", () => {
      const plan = createPlan({
        phases: [
          {
            name: "initialize",
            order: -1,
          },
        ],

        size: 1,
      });

      expect(() => validator.validate(plan)).toThrow(
        'Bootstrap phase "initialize" has negative order.',
      );
    });

    it("should reject duplicated execution orders", () => {
      const plan = createPlan({
        phases: [
          {
            name: "initialize",
            order: 0,
          },

          {
            name: "runtime",
            order: 0,
          },
        ],

        size: 2,
      });

      expect(() => validator.validate(plan)).toThrow(
        'Duplicate execution order "0" for phase "runtime".',
      );
    });

    it("should reject non deterministic phase ordering", () => {
      const plan = createPlan({
        phases: [
          {
            name: "runtime",
            order: 1,
          },

          {
            name: "initialize",
            order: 0,
          },
        ],

        size: 2,
      });

      expect(() => validator.validate(plan)).toThrow(
        'Bootstrap phase "initialize" is not deterministically ordered.',
      );
    });
  });

  /* ===========================================================================
   * Isolation
   * ========================================================================= */

  describe("immutability", () => {
    it("should not mutate execution plan", () => {
      const plan = createPlan();

      const snapshot = structuredClone(plan);

      validator.validate(plan);

      expect(plan).toEqual(snapshot);
    });
  });
});

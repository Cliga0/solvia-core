import { PipelineBuilder } from "../pipeline.builder";

import type { BootstrapPhase } from "../../contracts/bootstrap-phase";

/* =============================================================================
 * Pipeline Builder Tests
 * =============================================================================
 *
 * Contract tests for immutable bootstrap execution plan construction.
 *
 * Guarantees:
 *
 * • deterministic ordering
 * • duplicate protection
 * • defensive copying
 * • immutable execution plans
 * • metadata integrity
 * • builder isolation
 *
 * =============================================================================
 */

describe("PipelineBuilder", () => {
  const createPhase = (
    overrides: Partial<BootstrapPhase> = {},
  ): BootstrapPhase =>
    ({
      name: "initialize",

      order: 0,

      internal: false,

      ...overrides,
    }) as BootstrapPhase;

  const createBuilder = (): PipelineBuilder => new PipelineBuilder();

  /* ===========================================================================
   * Creation
   * ========================================================================= */

  describe("creation", () => {
    it("should create builder instance", () => {
      const builder = createBuilder();

      expect(builder).toBeInstanceOf(PipelineBuilder);
    });
  });

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  describe("registration", () => {
    it("should register bootstrap phase", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(plan.size).toBe(1);

      expect(plan.phases[0].name).toBe("initialize");
    });

    it("should support fluent registration", () => {
      const builder = createBuilder();

      expect(builder.addPhase(createPhase())).toBe(builder);
    });

    it("should reject duplicated phase names", () => {
      const builder = createBuilder();

      builder.addPhase(
        createPhase({
          name: "initialize",
        }),
      );

      expect(() =>
        builder.addPhase(
          createPhase({
            name: "initialize",
          }),
        ),
      ).toThrow("Pipeline phase already registered: initialize");
    });

    it("should preserve registered phase definition", () => {
      const phase = createPhase({
        name: "initialize",
      });

      const plan = createBuilder().addPhase(phase).build();

      expect(plan.phases[0]).toEqual(phase);

      expect(plan.phases[0]).not.toBe(phase);
    });
  });

  /* ===========================================================================
   * Build
   * ========================================================================= */

  describe("build", () => {
    it("should create execution plan", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(plan.id).toContain("pipeline-");

      expect(plan.createdAt).toBeInstanceOf(Date);
    });

    it("should keep size consistent with phases", () => {
      const plan = createBuilder()
        .addPhase(
          createPhase({
            name: "initialize",
            order: 0,
          }),
        )

        .addPhase(
          createPhase({
            name: "runtime",
            order: 1,
          }),
        )

        .build();

      expect(plan.size).toBe(2);

      expect(plan.size).toBe(plan.phases.length);
    });

    it("should generate unique plan identities", () => {
      const builder = createBuilder().addPhase(createPhase());

      const first = builder.build();

      const second = builder.build();

      expect(first).not.toBe(second);

      expect(first.id).not.toBe(second.id);
    });
  });

  /* ===========================================================================
   * Ordering
   * ========================================================================= */

  describe("ordering", () => {
    it("should sort phases by execution order", () => {
      const plan = createBuilder()
        .addPhase(
          createPhase({
            name: "runtime",
            order: 10,
          }),
        )

        .addPhase(
          createPhase({
            name: "initialize",
            order: 0,
          }),
        )

        .build();

      expect(plan.phases.map((phase) => phase.name)).toEqual([
        "initialize",
        "runtime",
      ]);
    });

    it("should resolve identical orders deterministically", () => {
      const plan = createBuilder()
        .addPhase(
          createPhase({
            name: "zeta",
            order: 0,
          }),
        )

        .addPhase(
          createPhase({
            name: "alpha",
            order: 0,
          }),
        )

        .build();

      expect(plan.phases.map((phase) => phase.name)).toEqual(["alpha", "zeta"]);
    });
  });

  /* ===========================================================================
   * Immutability
   * ========================================================================= */

  describe("immutability", () => {
    it("should freeze execution plan", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(Object.isFrozen(plan)).toBe(true);
    });

    it("should freeze phase collection", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(Object.isFrozen(plan.phases)).toBe(true);
    });

    it("should freeze individual phase objects", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(Object.isFrozen(plan.phases[0])).toBe(true);
    });

    it("should not share phase references", () => {
      const phase = createPhase();

      const plan = createBuilder().addPhase(phase).build();

      expect(plan.phases[0]).not.toBe(phase);
    });

    it("should freeze metadata", () => {
      const plan = createBuilder().addPhase(createPhase()).build();

      expect(Object.isFrozen(plan.metadata)).toBe(true);
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata", () => {
    it("should expose builder metadata", () => {
      const plan = createBuilder()
        .addPhase(
          createPhase({
            name: "initialize",
          }),
        )

        .build();

      expect(plan.metadata.source).toBe("pipeline-builder");

      expect(plan.metadata.phases).toEqual(["initialize"]);
    });
  });

  /* ===========================================================================
   * Isolation
   * ========================================================================= */

  describe("isolation", () => {
    it("should create isolated execution plans", () => {
      const builder = createBuilder().addPhase(createPhase());

      const first = builder.build();

      const second = builder.build();

      expect(first).not.toBe(second);

      expect(first.phases).not.toBe(second.phases);

      expect(first.phases).toEqual(second.phases);
    });
  });
});

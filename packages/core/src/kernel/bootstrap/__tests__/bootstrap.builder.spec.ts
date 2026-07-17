import { BootstrapBuilder } from "../bootstrap.builder";

import type { BootstrapAction } from "../contracts/bootstrap-action";
import type { BootstrapPhase } from "../contracts/bootstrap-phase";

/* =============================================================================
 * Bootstrap Builder Tests
 * =============================================================================
 *
 * Contract tests for immutable bootstrap execution plan creation.
 *
 * =============================================================================
 */

describe("BootstrapBuilder", () => {
  const createPhase = (name: string, order: number): BootstrapPhase =>
    ({
      name,

      order,
    }) as BootstrapPhase;

  const createAction = (name: string, order: number): BootstrapAction =>
    ({
      phase: createPhase(name, order),

      execute: jest.fn(),
    }) as BootstrapAction;

  /* ===========================================================================
   * Factory
   * ========================================================================= */

  describe("create", () => {
    it("should create builder with default configuration", () => {
      const builder = BootstrapBuilder.create();

      expect(builder).toBeInstanceOf(BootstrapBuilder);
    });

    it("should accept custom identity options", () => {
      const builder = BootstrapBuilder.create({
        id: "custom-bootstrap",
        version: 5,
      });

      const plan = builder.build();

      expect(plan.version).toBe(5);
    });
  });

  /* ===========================================================================
   * Registration
   * ========================================================================= */

  describe("add", () => {
    it("should register bootstrap action", () => {
      const action = createAction("database", 10);

      const plan = BootstrapBuilder.create().add(action).build();

      expect(plan.count).toBe(1);

      expect(plan.steps[0].action).toBe(action);
    });

    it("should reject duplicated bootstrap phases", () => {
      const builder = BootstrapBuilder.create();

      builder.add(createAction("database", 10));

      expect(() => builder.add(createAction("database", 20))).toThrow(
        "Bootstrap phase already registered: database",
      );
    });

    it("should register multiple actions", () => {
      const plan = BootstrapBuilder.create()
        .addMany([createAction("database", 10), createAction("cache", 20)])
        .build();

      expect(plan.count).toBe(2);
    });
  });

  /* ===========================================================================
   * Ordering
   * ========================================================================= */

  describe("ordering", () => {
    it("should order phases by execution order", () => {
      const plan = BootstrapBuilder.create()
        .add(createAction("application", 30))
        .add(createAction("database", 10))
        .add(createAction("cache", 20))
        .build();

      expect(plan.steps.map((step) => step.phase.name)).toEqual([
        "database",
        "cache",
        "application",
      ]);
    });
  });

  /* ===========================================================================
   * Build contract
   * ========================================================================= */

  describe("build", () => {
    it("should generate immutable bootstrap plan", () => {
      const plan = BootstrapBuilder.create()
        .add(createAction("database", 1))
        .build();

      expect(Object.isFrozen(plan)).toBe(true);

      expect(Object.isFrozen(plan.steps)).toBe(true);

      expect(Object.isFrozen(plan.steps[0])).toBe(true);
    });

    it("should generate unique plan identifiers", () => {
      const first = BootstrapBuilder.create().build();

      const second = BootstrapBuilder.create().build();

      expect(first.id).not.toEqual(second.id);
    });

    it("should expose creation timestamp", () => {
      const before = new Date();

      const plan = BootstrapBuilder.create().build();

      const after = new Date();

      expect(plan.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());

      expect(plan.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata", () => {
    it("should include registered phases in metadata", () => {
      const plan = BootstrapBuilder.create()
        .add(createAction("database", 10))
        .build();

      expect(plan.metadata.phases).toEqual(["database"]);
    });

    it("should merge custom metadata", () => {
      const plan = BootstrapBuilder.create()
        .withMetadata({
          environment: "test",
        })
        .build();

      expect(plan.metadata).toMatchObject({
        source: "kernel",

        environment: "test",
      });
    });
  });

  /* ===========================================================================
   * Step metadata
   * ========================================================================= */

  describe("step options", () => {
    it("should preserve step dependencies and metadata", () => {
      const action = createAction("application", 10);

      const plan = BootstrapBuilder.create()
        .add(action, {
          dependencies: ["database"],

          metadata: {
            owner: "kernel",
          },
        })
        .build();

      expect(plan.steps[0].dependencies).toEqual(["database"]);

      expect(plan.steps[0].metadata).toEqual({
        owner: "kernel",
      });
    });
  });
});

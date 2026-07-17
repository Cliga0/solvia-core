import { ContributionValidator } from "../contribution.validator";

import type { KernelContribution } from "../../contracts/kernel-contribution";
import type { ContributionHooks } from "../../lifecycle/contribution.hooks";

/* =============================================================================
 * Contribution Validator Tests
 * =============================================================================
 *
 * Contract tests validating Kernel contribution integrity rules.
 *
 * These tests guarantee that invalid contributions are rejected before:
 *
 *  • registration
 *  • dependency resolution
 *  • lifecycle execution
 *
 * =============================================================================
 */

describe("ContributionValidator", () => {
  /* ===========================================================================
   * Fixtures
   * ========================================================================= */

  const createContribution = (
    overrides: Partial<KernelContribution> = {},
  ): KernelContribution =>
    ({
      name: "test-contribution",

      manifest: {
        metadata: {},
      },

      dependencies: [],

      metadata: {},

      hooks: {},

      ...overrides,
    }) as KernelContribution;

  const createHook = (): ContributionHooks => ({
    beforeLoad: jest.fn(),
    load: jest.fn(),
    afterLoad: jest.fn(),
    beforeStart: jest.fn(),
    start: jest.fn(),
    ready: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
    error: jest.fn(),
  });

  /* ===========================================================================
   * Valid contribution
   * ========================================================================= */

  describe("valid contribution", () => {
    it("should accept a complete contribution", () => {
      const contribution = createContribution();

      expect(() => ContributionValidator.validate(contribution)).not.toThrow();
    });

    it("should accept contribution with lifecycle hooks", () => {
      const contribution = createContribution({
        hooks: createHook(),
      });

      expect(() => ContributionValidator.validate(contribution)).not.toThrow();
    });

    it("should accept contribution without optional metadata", () => {
      const contribution = createContribution({
        metadata: undefined,
      });

      expect(() => ContributionValidator.validate(contribution)).not.toThrow();
    });
  });

  /* ===========================================================================
   * Null safety
   * ========================================================================= */

  describe("contribution existence", () => {
    it("should reject undefined contribution", () => {
      expect(() =>
        ContributionValidator.validate(
          undefined as unknown as KernelContribution,
        ),
      ).toThrow("Contribution cannot be null or undefined.");
    });

    it("should reject null contribution", () => {
      expect(() =>
        ContributionValidator.validate(null as unknown as KernelContribution),
      ).toThrow("Contribution cannot be null or undefined.");
    });
  });

  /* ===========================================================================
   * Identity
   * ========================================================================= */

  describe("identity validation", () => {
    it("should reject missing name", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            name: undefined as unknown as string,
          }),
        ),
      ).toThrow("Contribution must define a valid name.");
    });

    it("should reject empty name", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            name: "",
          }),
        ),
      ).toThrow("Contribution must define a valid name.");
    });

    it("should reject whitespace name", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            name: "     ",
          }),
        ),
      ).toThrow("Contribution must define a valid name.");
    });
  });

  /* ===========================================================================
   * Manifest
   * ========================================================================= */

  describe("manifest validation", () => {
    it("should reject missing manifest", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            manifest: undefined,
          }),
        ),
      ).toThrow('Contribution "test-contribution" must define a manifest.');
    });
  });

  /* ===========================================================================
   * Dependencies
   * ========================================================================= */

  describe("dependency validation", () => {
    it("should allow empty dependency list", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            dependencies: [],
          }),
        ),
      ).not.toThrow();
    });

    it("should allow valid dependencies", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            dependencies: ["database", "cache"],
          }),
        ),
      ).not.toThrow();
    });

    it("should reject empty dependency name", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            dependencies: [""],
          }),
        ),
      ).toThrow('Invalid dependency in contribution "test-contribution".');
    });

    it("should reject non string dependency", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            dependencies: [123] as unknown as string[],
          }),
        ),
      ).toThrow('Invalid dependency in contribution "test-contribution".');
    });

    it("should reject duplicated dependencies", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            dependencies: ["database", "database"],
          }),
        ),
      ).toThrow(
        'Duplicate dependency "database" in contribution "test-contribution".',
      );
    });
  });

  /* ===========================================================================
   * Lifecycle hooks
   * ========================================================================= */

  describe("hooks validation", () => {
    it("should accept valid lifecycle hooks", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            hooks: {
              load: jest.fn(),
            },
          }),
        ),
      ).not.toThrow();
    });

    it("should accept missing hooks", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            hooks: undefined,
          }),
        ),
      ).not.toThrow();
    });

    it("should reject non function lifecycle hook", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            hooks: {
              load: "invalid",
            } as unknown as ContributionHooks,
          }),
        ),
      ).toThrow(
        'Invalid lifecycle hook "load" in contribution "test-contribution".',
      );
    });
  });

  /* ===========================================================================
   * Metadata
   * ========================================================================= */

  describe("metadata validation", () => {
    it("should accept object metadata", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            metadata: {
              environment: "test",
            },
          }),
        ),
      ).not.toThrow();
    });

    it("should reject primitive metadata", () => {
      expect(() =>
        ContributionValidator.validate(
          createContribution({
            metadata: "invalid" as unknown as Record<string, unknown>,
          }),
        ),
      ).toThrow('Invalid metadata for contribution "test-contribution".');
    });
  });

  /* ===========================================================================
   * Batch validation
   * ========================================================================= */

  describe("validateMany", () => {
    it("should validate multiple unique contributions", () => {
      expect(() =>
        ContributionValidator.validateMany([
          createContribution({
            name: "database",
          }),

          createContribution({
            name: "cache",
          }),
        ]),
      ).not.toThrow();
    });

    it("should reject duplicate contribution names", () => {
      expect(() =>
        ContributionValidator.validateMany([
          createContribution({
            name: "database",
          }),

          createContribution({
            name: "database",
          }),
        ]),
      ).toThrow('Duplicate contribution name "database".');
    });
  });
});

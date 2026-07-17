import { BootstrapLoader } from "../bootstrap.loader";
import { BootstrapEngine } from "../bootstrap.engine";

import { BootstrapProfile } from "../enums/bootstrap-profile.enum";

describe("BootstrapLoader", () => {
  describe("load", () => {
    it("should bootstrap a Kernel runtime", async () => {
      const runtime = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      expect(runtime).toBeDefined();
      expect(runtime.id).toEqual(expect.any(String));
    });

    it("should return an immutable runtime", async () => {
      const runtime = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      expect(Object.isFrozen(runtime)).toBe(true);
    });

    it("should preserve bootstrap metadata", async () => {
      const metadata = {
        providers: [],
        imports: [],
      };

      const runtime = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
        metadata,
      });

      expect(runtime.context.metadata).toEqual(metadata);
    });

    it("should reject invalid bootstrap options", async () => {
      await expect(
        BootstrapLoader.load({
          profile: "invalid-profile" as never,
        }),
      ).rejects.toThrow();
    });

    it("should create an independent runtime for each invocation", async () => {
      const first = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      const second = await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      expect(first).not.toBe(second);
      expect(first.id).not.toBe(second.id);
    });
  });

  describe("loadAsync", () => {
    it("should resolve asynchronous bootstrap options", async () => {
      const runtime = await BootstrapLoader.loadAsync(
        Promise.resolve({
          profile: BootstrapProfile.TESTING,
        }),
      );

      expect(runtime.profile).toBe(BootstrapProfile.TESTING);
    });

    it("should propagate asynchronous validation failures", async () => {
      await expect(
        BootstrapLoader.loadAsync(
          Promise.resolve({
            profile: "invalid-profile" as never,
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe("architecture boundary", () => {
    it("should delegate runtime creation to BootstrapEngine", async () => {
      const boot = jest.spyOn(BootstrapEngine.prototype, "boot");

      await BootstrapLoader.load({
        profile: BootstrapProfile.TESTING,
      });

      expect(boot).toHaveBeenCalledTimes(1);

      boot.mockRestore();
    });
  });
});

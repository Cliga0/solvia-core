import type { BootstrapOptions } from "../contracts/bootstrap-options";

import { BootstrapProfile } from "../enums/bootstrap-profile.enum";

export class BootstrapOptionsValidator {
  public static validate(options: BootstrapOptions): void {
    this.validateProfile(options.profile);
  }

  private static validateProfile(profile?: BootstrapProfile): void {
    if (!profile) {
      return;
    }

    const profiles = Object.values(BootstrapProfile);

    if (!profiles.includes(profile)) {
      throw new Error(`Invalid bootstrap profile "${profile}".`);
    }
  }
}

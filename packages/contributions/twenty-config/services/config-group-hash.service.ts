import { Injectable } from '@nestjs/common';

import { createHash } from 'crypto';

import { ConfigVariables } from '../config-variables';
import { type ConfigVariablesGroup } from '../enums/config-variables-group.enum';
import { TwentyConfigService } from '../twenty-config.service';
import { TypedReflect } from '../placeholders/typed-reflect';

@Injectable()
export class ConfigGroupHashService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  computeHash(group: ConfigVariablesGroup): string {
    const groupVariables = this.getConfigVariablesByGroup(group);

    const configValues = groupVariables
      .map(
        (key) => `${key}=${JSON.stringify(this.twentyConfigService.get(key))}`,
      )
      .sort()
      .join('|');

    return createHash('sha256')
      .update(configValues)
      .digest('hex')
      .substring(0, 16);
  }

  private getConfigVariablesByGroup(
    group: ConfigVariablesGroup,
  ): Array<keyof ConfigVariables> {
    const metadata =
      TypedReflect.getMetadata<Record<string, any>> ('config-variables', ConfigVariables) ?? {};

    return Object.keys(metadata)
      .filter((key) => metadata[key]?.group === group)
      .map((key) => key as keyof ConfigVariables);
  }
}

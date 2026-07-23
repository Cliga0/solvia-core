import { type DynamicModule, Global, Module } from '@nestjs/common';

import { ConfigVariables } from './config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from './constants/config-variables-instance-tokens.constants';
import { DatabaseConfigModule } from './drivers/database-config.module';
import { ConfigGroupHashService } from './services/config-group-hash.service';
import { ConfigurableModuleClass } from './twenty-config.module-definition';
import { TwentyConfigService } from './twenty-config.service';

@Global()
@Module({})
export class TwentyConfigModule extends ConfigurableModuleClass {
  static forRoot(): DynamicModule {
    const isConfigVariablesInDbEnabled =
      process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED !== 'false';

    const imports = isConfigVariablesInDbEnabled
      ? [DatabaseConfigModule.forRoot()]
      : [];

    return {
      module: TwentyConfigModule,
      imports,
      providers: [
        TwentyConfigService,
        ConfigGroupHashService,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [TwentyConfigService, ConfigGroupHashService],
    };
  }
}

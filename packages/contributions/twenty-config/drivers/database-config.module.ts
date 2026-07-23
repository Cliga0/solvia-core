import { type DynamicModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeyValuePairEntity } from '../placeholders/key-value-pair.entity';
import { SecretEncryptionModule } from '../placeholders/secret-encryption.module';
import { ConfigCacheService } from '../cache/config-cache.service';
import { ConfigVariables } from '../config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from '../constants/config-variables-instance-tokens.constants';
import { ConfigValueConverterService } from '../conversion/config-value-converter.service';
import { DatabaseConfigDriver } from './database-config.driver';
import { ConfigStorageService } from '../storage/config-storage.service';

@Module({})
export class DatabaseConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseConfigModule,
      imports: [
        TypeOrmModule.forFeature([KeyValuePairEntity]),
        ScheduleModule.forRoot(),
        SecretEncryptionModule,
      ],
      providers: [
        DatabaseConfigDriver,
        ConfigCacheService,
        ConfigStorageService,
        ConfigValueConverterService,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [DatabaseConfigDriver],
    };
  }
}

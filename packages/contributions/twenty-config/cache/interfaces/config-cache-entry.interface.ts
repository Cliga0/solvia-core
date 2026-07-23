import { type ConfigVariables } from '../../config-variables';

export type ConfigKey = keyof ConfigVariables;
export type ConfigValue<T extends ConfigKey> = ConfigVariables[T];

export interface ConfigCacheEntry<T extends ConfigKey> {
  value: ConfigValue<T>;
}

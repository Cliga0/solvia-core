import { type ConfigVariableType } from '../enums/config-variable-type.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from '../twenty-config.exception';
import { type ConfigVariableOptions } from '../types/config-variable-options.type';
import { typeTransformers } from './type-transformers.registry';

export function applyBasicValidators(
  type: ConfigVariableType,
  target: object,
  propertyKey: string,
  options?: ConfigVariableOptions,
): void {
  const transformer = typeTransformers[type];

  if (!transformer) {
    throw new ConfigVariableException(
      `Unsupported config variable type: ${type}`,
      ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE,
    );
  }

  transformer
    .getTransformers()
    .forEach((decorator) => decorator(target, propertyKey));

  transformer
    .getValidators(options)
    .forEach((decorator) => decorator(target, propertyKey));
}

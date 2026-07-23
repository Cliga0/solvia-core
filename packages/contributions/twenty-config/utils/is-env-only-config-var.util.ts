import { ConfigVariables } from '../config-variables';
import { TypedReflect } from '../placeholders/typed-reflect';

export const isEnvOnlyConfigVar = (key: keyof ConfigVariables): boolean => {
  const metadata =
    TypedReflect.getMetadata<Record<string, any>> ('config-variables', ConfigVariables) ?? {};
  const envMetadata = metadata[key];

  return !!envMetadata?.isEnvOnly;
};

/**
 * Placeholder for Twenty's TypedReflect utility.
 * Minimal shim around Reflect metadata API.
 * TODO: Replace with Solvia's own typed-reflect implementation.
 */
export const TypedReflect = {
  getMetadata<T>(metadataKey: string, target: object): T | undefined {
    return Reflect.getMetadata(metadataKey, target) as T | undefined;
  },
  defineMetadata(
    metadataKey: string,
    metadataValue: unknown,
    target: object,
  ): void {
    Reflect.defineMetadata(metadataKey, metadataValue, target);
  },
};

/**
 * Placeholder for twenty-shared/utils.assertUnreachable.
 * Exhaustiveness check for union types.
 * TODO: Replace with Solvia's own shared utilities package.
 */
export function assertUnreachable(value: never): never {
  throw new Error(
    `Unreachable code executed. Unexpected value: ${JSON.stringify(value)}`,
  );
}

/**
 * Placeholder for twenty-shared/utils.isDefined.
 * TODO: Replace with Solvia's own shared utilities package.
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

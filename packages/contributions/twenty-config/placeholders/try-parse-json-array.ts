/**
 * Placeholder for Twenty's tryParseJsonArray utility.
 * TODO: Replace with Solvia's own utility.
 */
export function tryParseJsonArray(
  value: string,
): unknown[] | undefined {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

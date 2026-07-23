import type { MessageDescriptor } from './lingui-core';

/**
 * Placeholder for @lingui/core/macro `msg` tagged template.
 * The real macro transforms template strings into MessageDescriptor at build time.
 * This shim returns a plain object with the `message` field set to the template content.
 * TODO: Replace with Solvia's own i18n solution.
 */
export function msg(
  strings: TemplateStringsArray,
  ..._values: unknown[]
): MessageDescriptor {
  return {
    id: strings.join(''),
    message: strings.join(''),
  };
}

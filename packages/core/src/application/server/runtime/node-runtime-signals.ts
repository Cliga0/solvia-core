/* =============================================================================
 * Node Runtime Signals
 * =============================================================================
 */

import { RuntimeSignals } from "./runtime-signals";

export class NodeRuntimeSignals implements RuntimeSignals {
  private constructor() {}

  public static create(): NodeRuntimeSignals {
    return new NodeRuntimeSignals();
  }

  public on(
    signal: string,
    listener: () => void | Promise<void>,
  ): void {
    process.once(signal, () => {
      void listener();
    });
  }
}
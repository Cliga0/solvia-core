/* =============================================================================
 * Runtime Signals
 * =============================================================================
 *
 * Runtime abstraction responsible for operating system signal registration.
 *
 * This isolates platform-specific signal handling from the server runtime.
 *
 * =============================================================================
 */

export interface RuntimeSignals {
  /**
   * Register a signal listener.
   */
  on(
    signal: string,
    listener: () => void | Promise<void>,
  ): void;
}
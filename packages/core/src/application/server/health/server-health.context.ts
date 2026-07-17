import type { ServerLifecycleSnapshot } from "../server.lifecycle";

/* =============================================================================
 * Server Health Context
 * =============================================================================
 *
 * Read-only view of server runtime state.
 *
 * Health components consume this context.
 *
 * They never mutate lifecycle.
 *
 * =============================================================================
 */

export interface ServerHealthContext {
  snapshot(): ServerLifecycleSnapshot;
}
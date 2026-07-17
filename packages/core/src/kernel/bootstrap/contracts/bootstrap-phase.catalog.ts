import type { BootstrapPhase } from "./bootstrap-phase";

export const BootstrapPhasesCatalog = Object.freeze({
  INITIALIZE: Object.freeze({
    name: "initialize",
    order: 10,
  }),

  RESOLVE_CONTRIBUTIONS: Object.freeze({
    name: "resolve-contributions",
    order: 20,
  }),

  LOAD_CONTRIBUTIONS: Object.freeze({
    name: "load-contributions",
    order: 30,
  }),

  DISCOVERY: Object.freeze({
    name: "discovery",
    order: 40,
  }),

  REGISTRY: Object.freeze({
    name: "registry",
    order: 50,
  }),

  PIPELINE: Object.freeze({
    name: "pipeline",
    order: 60,
    internal: true,
  }),

  RUNTIME: Object.freeze({
    name: "runtime",
    order: 70,
  }),
} satisfies Record<string, BootstrapPhase>);

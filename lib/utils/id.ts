/**
 * Small deterministic-ish id helpers. We avoid Math.random in seed data so demo
 * output stays stable across renders; runtime-created records use a counter+time.
 */

let counter = 1000;

export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString(36).toUpperCase()}`;
}

/** Stable id for seed data, derived from a slug. */
export function seedId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

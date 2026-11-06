// Adapted from Base UI v1.9.0 (packages/react/src/utils/resolveClassName.ts). See NOTICE.txt.
import type { ClassValue } from "svelte/elements";

/**
 * If the provided class value is a function, calls it with the state.
 * Otherwise returns it as is.
 */
export function resolveClassName<State>(
  value: ClassValue | ((state: State) => ClassValue) | undefined,
  state: State,
): ClassValue | undefined {
  return typeof value === "function" ? value(state) : value;
}

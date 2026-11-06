// Adapted from Base UI v1.9.0 (packages/react/src/utils/resolveStyle.ts). See NOTICE.txt.

/**
 * If the provided style is a function, calls it with the state.
 * Otherwise returns it as is.
 */
export function resolveStyle<State>(
  value: string | ((state: State) => string | undefined) | undefined,
  state: State,
): string | undefined {
  return typeof value === "function" ? value(state) : value;
}

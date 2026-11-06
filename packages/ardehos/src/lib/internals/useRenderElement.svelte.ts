// Adapted from Base UI v1.9.0 (packages/react/src/internals/useRenderElement.tsx). See NOTICE.txt.
import type { ClassValue } from "svelte/elements";
import { mergeProps, type Props } from "#lib/merge-props/mergeProps.js";
import {
  getStateAttributesProps,
  type StateAttributesMapping,
} from "#lib/internals/getStateAttributesProps.js";
import { resolveClassName } from "#lib/utils/resolveClassName.js";
import { resolveStyle } from "#lib/utils/resolveStyle.js";

export type UseRenderElementOptions<State> = {
  /** The part's state, shown as `data-*` attributes and passed to `class` / `style` functions. */
  state: State;
  /** The user's `class`: a value or a function of state. */
  class?: ClassValue | ((state: State) => ClassValue) | undefined;
  /** The user's `style`: a string or a function of state. */
  style?: string | ((state: State) => string | undefined) | undefined;
  /** Maps state to `data-*` attributes, for keys that don't use the default mapping. */
  mapping?: StateAttributesMapping<State>;
  /** Prop sources merged after the state attributes; the rightmost (the user's) wins. */
  props: Array<Props | ((props: Props) => Props) | undefined>;
};

/**
 * Computes the props a part spreads onto its element (or passes to a render snippet):
 * `mergeProps(stateAttributes, ...props)`, plus the resolved `class` and `style`.
 * Call it during component initialisation; `props` stays up to date as `options` changes.
 */
export function useRenderElement<State extends Record<string, unknown>>(
  options: () => UseRenderElementOptions<State>,
): { readonly props: Props } {
  const props = $derived.by(() => {
    const { state, class: classValue, style: styleValue, mapping, props: sources } = options();
    const resolved: Props = {};
    const className = resolveClassName(classValue, state);
    if (className !== undefined) {
      resolved.class = className;
    }
    const style = resolveStyle(styleValue, state);
    if (style !== undefined) {
      resolved.style = style;
    }
    return mergeProps(getStateAttributesProps(state, mapping), ...sources, resolved);
  });

  return {
    get props() {
      return props;
    },
  };
}

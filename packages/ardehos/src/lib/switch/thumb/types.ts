// Adapted from Base UI v1.9.0 (packages/react/src/switch/thumb/SwitchThumb.tsx). See NOTICE.txt.
import type { Snippet } from "svelte";
import type { ClassValue, HTMLAttributes } from "svelte/elements";
import type { RenderProps, WithComponentHandlers } from "#lib/internals/types.js";
import type { SwitchRootState } from "../root/types.js";

export type SwitchThumbState = SwitchRootState;

type OwnProps = {
  /**
   * A class for the element: a value, or a function of the state.
   */
  class?: ClassValue | ((state: SwitchThumbState) => ClassValue) | undefined;
  /**
   * A style for the element: a string, or a function of the state.
   */
  style?: string | ((state: SwitchThumbState) => string | undefined) | undefined;
  /**
   * Replaces the element. Spread `props` onto the element you render.
   */
  render?: Snippet<[{ props: RenderProps; state: SwitchThumbState }]> | undefined;
  /**
   * The element's content. Ignored when `render` is given.
   */
  children?: Snippet<[{ state: SwitchThumbState }]> | undefined;
  /**
   * The rendered element. Bindable.
   */
  ref?: HTMLElement | null | undefined;
};

export type SwitchThumbProps = WithComponentHandlers<
  Omit<HTMLAttributes<HTMLSpanElement>, keyof OwnProps>
> &
  OwnProps;

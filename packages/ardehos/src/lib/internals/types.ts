// Adapted from Base UI v1.9.0 (packages/react/src/internals/types.ts). See NOTICE.txt.
import type { Attachment } from "svelte/attachments";

/** An event whose handlers can opt out of the handlers merged to their left. */
export type ComponentEvent<E extends Event> = E & {
  /** Stops the handlers merged to the left of the calling handler from running. */
  preventComponentHandler(): void;
  readonly componentHandlerPrevented?: boolean;
};

/**
 * The props a part spreads onto its element, or hands to a `render` snippet. Typed so that
 * `<button {...props}>` type-checks: symbol keys hold attachments, as in `svelte/elements`.
 */
export type RenderProps = Record<string, unknown> & {
  [key: symbol]: Attachment | false | null | undefined;
};

type ComponentEventHandler<H> = H extends (event: infer E) => infer R
  ? E extends Event
    ? (event: ComponentEvent<E>) => R
    : H
  : H;

/**
 * Retypes the `on*` event handlers of element props (e.g. `HTMLAttributes<HTMLSpanElement>`) so
 * they receive a `ComponentEvent`, exposing `preventComponentHandler()`. The rest of each handler's
 * type, such as its `currentTarget`, is kept.
 */
export type WithComponentHandlers<Props> = {
  [K in keyof Props]: K extends `on${string}` ? ComponentEventHandler<Props[K]> : Props[K];
};

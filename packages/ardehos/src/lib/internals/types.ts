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

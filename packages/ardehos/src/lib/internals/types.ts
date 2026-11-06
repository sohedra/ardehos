// Adapted from Base UI v1.9.0 (packages/react/src/internals/types.ts). See NOTICE.txt.

/** An event whose handlers can opt out of the handlers merged to their left. */
export type ComponentEvent<E extends Event> = E & {
  /** Stops the handlers merged to the left of the calling handler from running. */
  preventComponentHandler(): void;
  readonly componentHandlerPrevented?: boolean;
};

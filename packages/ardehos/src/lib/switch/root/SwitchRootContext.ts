// Adapted from Base UI v1.9.0 (packages/react/src/switch/root/SwitchRootContext.ts). See NOTICE.txt.
import { createPartContext } from "#lib/internals/createPartContext.js";
import type { SwitchRootState } from "./types.js";

export type SwitchRootContext = SwitchRootState;

/** Switch.Root's state, for the parts placed within it. */
export const SwitchRootContext = createPartContext<SwitchRootContext>(
  "SwitchRootContext",
  "SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.",
);

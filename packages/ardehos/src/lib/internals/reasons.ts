// Adapted from Base UI v1.9.0 (packages/react/src/internals/reasons.ts). See NOTICE.txt.

import * as REASONS from "./reason-parts.js";

export { REASONS };
export type EventReasons = typeof REASONS;
export type EventReason = EventReasons[keyof EventReasons];

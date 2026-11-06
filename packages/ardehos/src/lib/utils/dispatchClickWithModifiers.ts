// Adapted from Base UI v1.9.0 (packages/react/src/utils/dispatchClickWithModifiers.ts). See NOTICE.txt.
import { ownerWindow } from "#lib/utils/owner.js";

type ModifierState = {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

/**
 * Dispatches a constructed click on the target so it carries the source event's
 * modifier state, which `click()` always reports as unpressed. Like `click()`,
 * the untrusted click still runs native activation behavior (form submission,
 * link navigation).
 * `detail` defaults to 0 and `pointerType` to `''` (the native convention for
 * keyboard-generated clicks). When the click represents a mouse gesture, pass
 * `detail: 1` and `pointerType: 'mouse'` so consumers don't classify it as a
 * keyboard activation.
 */
export function dispatchClickWithModifiers(
  target: Element,
  source: ModifierState,
  { detail = 0, pointerType = "" }: { detail?: number; pointerType?: string } = {},
): void {
  target.dispatchEvent(
    new (ownerWindow(target).PointerEvent)("click", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
      pointerType,
      shiftKey: source.shiftKey,
      ctrlKey: source.ctrlKey,
      altKey: source.altKey,
      metaKey: source.metaKey,
    }),
  );
}

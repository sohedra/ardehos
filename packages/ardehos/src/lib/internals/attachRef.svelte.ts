import { createAttachmentKey, type Attachment } from "svelte/attachments";

/**
 * Creates props holding one attachment that reports the element it is attached to: `set(node)`
 * on attach, `set(null)` on detach. Spread the result onto an element (or include it in a
 * part's props) and it follows the props, so a render snippet's element is reported too.
 *
 * Call it once per part instance: a new object means a new attachment key, which detaches and
 * re-attaches on every update.
 */
export function attachRef<E extends Element>(
  set: (element: E | null) => void,
): Record<symbol, Attachment<E>> {
  let current: E | null = null;
  return {
    [createAttachmentKey()]: (node: E) => {
      current = node;
      set(node);
      return () => {
        // When the element is replaced, the old one can detach after the new one attached.
        if (current === node) {
          current = null;
          set(null);
        }
      };
    },
  };
}

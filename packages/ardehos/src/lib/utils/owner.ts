// Adapted from Base UI v1.9.0 (packages/utils/src/owner.ts). See NOTICE.txt.

export function ownerDocument(node: Node | null | undefined): Document {
  return node?.ownerDocument || document;
}

export function ownerWindow(node: Node | null | undefined): Window & typeof globalThis {
  return (ownerDocument(node).defaultView || window) as Window & typeof globalThis;
}

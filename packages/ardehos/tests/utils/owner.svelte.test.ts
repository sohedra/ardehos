import { describe, expect, it } from "vitest";
import { ownerDocument, ownerWindow } from "#lib/utils/owner.js";

describe("owner", () => {
  it("returns the global document and window for a nullish node", () => {
    expect(ownerDocument(null)).toBe(document);
    expect(ownerWindow(undefined)).toBe(window);
  });
  it("returns the iframe's document and window for a node inside an iframe", async () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const node = iframe.contentDocument!.createElement("div");
    expect(ownerDocument(node)).toBe(iframe.contentDocument);
    expect(ownerWindow(node)).toBe(iframe.contentWindow);
    iframe.remove();
  });
});

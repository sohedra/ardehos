import { describe, expect, it } from "vitest";
import { attachRef } from "#lib/internals/attachRef.svelte.js";

describe("attachRef", () => {
  function setup() {
    const calls: Array<Element | null> = [];
    const props = attachRef<Element>((element) => calls.push(element));
    const keys = Object.getOwnPropertySymbols(props);
    return { calls, keys, attachment: props[keys[0]!]! };
  }

  it("holds one attachment that sets the element on attach and null on detach", () => {
    const { calls, keys, attachment } = setup();
    expect(keys).toHaveLength(1);
    const element = document.createElement("span");
    const detach = attachment(element);
    expect(calls).toEqual([element]);
    detach?.();
    expect(calls).toEqual([element, null]);
  });

  it("keeps the new element when the old one detaches after it attached", () => {
    const { calls, attachment } = setup();
    const first = document.createElement("span");
    const second = document.createElement("button");
    const detachFirst = attachment(first);
    attachment(second);
    detachFirst?.();
    expect(calls).toEqual([first, second]);
  });
});

import { describe, expect, it } from "vitest";
import { resolveStyle } from "#lib/utils/resolveStyle.js";

describe("resolveStyle", () => {
  it("calls a function with the state", () => {
    expect(resolveStyle((s: { w: number }) => `width: ${s.w}px`, { w: 3 })).toBe("width: 3px");
  });
  it("returns strings as is", () => {
    expect(resolveStyle("color: red", {})).toBe("color: red");
  });
  it("returns undefined for undefined", () => {
    expect(resolveStyle(undefined, {})).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { resolveClassName } from "#lib/utils/resolveClassName.js";

describe("resolveClassName", () => {
  it("calls a function with the state", () => {
    expect(resolveClassName((s: { on: boolean }) => (s.on ? "a" : "b"), { on: true })).toBe("a");
  });
  it("returns plain values as is", () => {
    expect(resolveClassName("x", {})).toBe("x");
    const arr = ["x", { y: true }];
    expect(resolveClassName(arr, {})).toBe(arr);
  });
  it("returns undefined for undefined", () => {
    expect(resolveClassName(undefined, {})).toBeUndefined();
  });
});

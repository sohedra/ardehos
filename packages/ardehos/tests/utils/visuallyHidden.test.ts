import { describe, expect, it } from "vitest";
import { visuallyHidden, visuallyHiddenInput } from "#lib/utils/visuallyHidden.js";

describe("visuallyHidden", () => {
  it.each([visuallyHidden, visuallyHiddenInput])("contains the shared declarations", (css) => {
    expect(css).toContain("clip-path: inset(50%)");
    expect(css).toContain("width: 1px");
    expect(css).toContain("height: 1px");
  });

  it("positions with fixed or absolute", () => {
    expect(visuallyHidden).toContain("position: fixed");
    expect(visuallyHiddenInput).toContain("position: absolute");
  });
});

import { describe, expect, it } from "vitest";
import { getStateAttributesProps } from "#lib/internals/getStateAttributesProps.js";

describe("getStateAttributesProps", () => {
  it("converts the state fields to data attributes", () => {
    expect(getStateAttributesProps({ checked: true, orientation: "vertical", count: 42 })).toEqual({
      "data-checked": "",
      "data-orientation": "vertical",
      "data-count": "42",
    });
  });

  it("changes the field names to lowercase", () => {
    expect(getStateAttributesProps({ readOnly: true })).toEqual({ "data-readonly": "" });
  });

  it("omits false values and renders true values without a value", () => {
    const result = getStateAttributesProps({ required: true, disabled: false });
    expect(result).toEqual({ "data-required": "" });
    expect(result).not.toHaveProperty("data-disabled");
  });

  it("supports custom mapping that replaces the default for its key", () => {
    const result = getStateAttributesProps(
      { checked: true, orientation: "vertical", count: 42 },
      { checked: (value) => ({ "data-state": value ? "checked" : "unchecked" }) },
    );
    expect(result).toEqual({
      "data-state": "checked",
      "data-orientation": "vertical",
      "data-count": "42",
    });
  });

  it("supports nulls returned from custom mapping", () => {
    const result = getStateAttributesProps(
      { checked: false, orientation: "vertical" },
      { checked: (value) => (value === true ? { "data-state": "checked" } : null) },
    );
    expect(result).toEqual({ "data-orientation": "vertical" });
  });
});

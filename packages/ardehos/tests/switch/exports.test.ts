import { describe, expect, it } from "vitest";
import * as library from "#lib/index.js";
import { Switch as RootSwitch } from "#lib/index.js";
import { Switch } from "#lib/switch/index.js";

describe("exports", () => {
  it("gives the same Switch parts from the library and the switch entry", () => {
    expect(RootSwitch.Root).toBe(Switch.Root);
    expect(RootSwitch.Thumb).toBe(Switch.Thumb);
    expect(Object.keys(Switch).sort()).toEqual(["Root", "Thumb"]);
  });

  it("exports only the Switch namespace at runtime", () => {
    expect(Object.keys(library)).toEqual(["Switch"]);
  });
});

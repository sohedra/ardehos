import type { Component } from "svelte";
import type { SwitchThumbState } from "#lib/switch/thumb/types.js";
import SwitchThumb from "#lib/switch/thumb/SwitchThumb.svelte";
import type { ConformanceSetup } from "../../conformance/conformanceSetup.js";
import SwitchThumbWrapper from "./SwitchThumbWrapper.svelte";

/** Switch.Thumb as the conformance suite sees it: its state is the root's, set by the wrapper. */
export const switchThumbConformance: ConformanceSetup<SwitchThumbState> = {
  part: SwitchThumb as Component<Record<string, unknown>>,
  wrapper: SwitchThumbWrapper,
  defaultTag: "span",
  state: {
    attribute: "data-checked",
    on: { checked: true },
    off: { checked: false },
    isOn: (state) => state.checked,
  },
};

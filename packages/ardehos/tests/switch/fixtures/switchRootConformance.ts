import type { Component } from "svelte";
import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
import type { SwitchRootState } from "#lib/switch/root/types.js";
import type { ConformanceSetup } from "../../conformance/conformanceSetup.js";

/** Switch.Root as the conformance suite sees it. Its own click handler toggles `checked`. */
export const switchRootConformance: ConformanceSetup<SwitchRootState> = {
  part: SwitchRoot as Component<Record<string, unknown>>,
  defaultTag: "span",
  // The render snippet renders a <button>, which Switch.Root only accepts as a native button.
  renderProps: { nativeButton: true },
  state: {
    attribute: "data-checked",
    on: { checked: true },
    off: { checked: false },
    isOn: (state) => state.checked,
  },
  readOwnClick: (element) => element.getAttribute("aria-checked"),
};

import type { ConformanceSetup } from "../conformance/conformanceSetup.js";
import TestPart, { type TestPartState } from "./TestPart.svelte";

/** TestPart as the conformance suite sees it. Its own click handler toggles `active`. */
export const testPartConformance: ConformanceSetup<TestPartState> = {
  part: TestPart,
  defaultTag: "span",
  state: {
    attribute: "data-active",
    on: { active: true },
    off: { active: false },
    isOn: (state) => state.active,
  },
  readOwnClick: (element) => element.hasAttribute("data-active"),
};

import { describeServerRender } from "../../conformance/ssrRender.js";
import { switchRootConformance } from "../fixtures/switchRootConformance.js";

describeServerRender("Switch.Root", () => switchRootConformance);

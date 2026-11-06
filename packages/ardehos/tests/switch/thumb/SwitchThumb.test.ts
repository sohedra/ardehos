import { describeServerRender } from "../../conformance/ssrRender.js";
import { switchThumbConformance } from "../fixtures/switchThumbConformance.js";

describeServerRender("Switch.Thumb", () => switchThumbConformance);

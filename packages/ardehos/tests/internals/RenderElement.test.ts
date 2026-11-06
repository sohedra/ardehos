import { describeServerRender } from "../conformance/ssrRender.js";
import { testPartConformance } from "../fixtures/testPartConformance.js";

describeServerRender("TestPart", () => testPartConformance);

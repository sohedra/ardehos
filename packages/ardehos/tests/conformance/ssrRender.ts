// The Node half of the server-render conformance test (see ssrHydration.ts for why it is split).
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import ConformanceHarness from "../fixtures/ConformanceHarness.svelte";
import { serverRenderProps, type ConformanceSetup } from "./conformanceSetup.js";

/**
 * Renders a part on the server and keeps the HTML in `tests/conformance/__ssr__/<name>.html`,
 * where `describeConformance` picks it up to hydrate. Use the same `name` and `setup` for both.
 * A missing file is written on a local run; CI fails instead, so commit the file.
 */
export function describeServerRender<State>(name: string, setup: () => ConformanceSetup<State>) {
  describe(`${name} server render`, () => {
    it("matches the HTML fixture the browser hydrates", async () => {
      const { body } = render(ConformanceHarness, { props: serverRenderProps(setup()) });
      const file = decodeURIComponent(new URL(`./__ssr__/${name}.html`, import.meta.url).pathname);
      await expect(body).toMatchFileSnapshot(file);
    });
  });
}

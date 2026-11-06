import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import SeveralSwitches from "./fixtures/SeveralSwitches.svelte";

// The Node half of the several-switches hydration test (see SwitchThumb.svelte.test.ts).
describe("several switches server render", () => {
  it("matches the HTML fixture the browser hydrates", async () => {
    const { body } = render(SeveralSwitches);
    const file = decodeURIComponent(new URL("./__ssr__/several.html", import.meta.url).pathname);
    await expect(body).toMatchFileSnapshot(file);
  });
});

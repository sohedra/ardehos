import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import RenderElement from "#lib/internals/RenderElement.svelte";
import { describeConformance } from "../conformance/describeConformance.js";
import TestPartRenderButton from "../fixtures/TestPartRenderButton.svelte";
import { testPartConformance } from "../fixtures/testPartConformance.js";

describeConformance("TestPart", () => testPartConformance);

describe("TestPart render snippet", () => {
  // The fixture's snippet is unannotated, so `pnpm check` guards that `props` spreads on an element.
  it("renders an unannotated render snippet that spreads props", async () => {
    const { getByRole } = await render(TestPartRenderButton, { props: { active: true } });
    const button = getByRole("button", { name: "Press" });
    await expect.element(button).toHaveAttribute("data-active");
    await expect.element(button).toHaveAttribute("data-testid", "part");
  });
});

// `rerender` can't be used here: it reads a `props` key as its deprecated `{ props }` form.
async function renderElement(tag: string, props: Record<string, unknown> = {}) {
  const { container } = await render(RenderElement, { props: { tag, props, state: {} } });
  return container.querySelector(tag);
}

describe("RenderElement", () => {
  it('adds type="button" to a button unless provided', async () => {
    expect((await renderElement("button"))?.getAttribute("type")).toBe("button");
    expect((await renderElement("button", { type: "submit" }))?.getAttribute("type")).toBe(
      "submit",
    );
  });

  it('adds alt="" to an img unless provided', async () => {
    expect((await renderElement("img"))?.getAttribute("alt")).toBe("");
    expect((await renderElement("img", { alt: "Avatar" }))?.getAttribute("alt")).toBe("Avatar");
  });

  it("adds no default attributes to other elements", async () => {
    expect((await renderElement("div", { id: "plain" }))?.getAttributeNames()).toEqual(["id"]);
  });
});

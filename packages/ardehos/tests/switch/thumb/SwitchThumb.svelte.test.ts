import { flushSync } from "svelte";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import SwitchThumb from "#lib/switch/thumb/SwitchThumb.svelte";
import { describeConformance } from "../../conformance/describeConformance.js";
import { ssrHydration } from "../../conformance/ssrHydration.js";
import SeveralSwitches from "../fixtures/SeveralSwitches.svelte";
import SwitchWithThumb from "../fixtures/SwitchWithThumb.svelte";
import { switchThumbConformance } from "../fixtures/switchThumbConformance.js";

const severalHtml = import.meta.glob<string>("../__ssr__/several.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

describeConformance("Switch.Thumb", () => switchThumbConformance);

describe("Switch.Thumb", () => {
  it("throws a descriptive error when rendered outside Switch.Root", async () => {
    // Svelte's dev build appends the component stack to the message.
    await expect(render(SwitchThumb)).rejects.toThrow(
      "SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.",
    );
  });

  it("mirrors the root's data attributes", async () => {
    const { rerender } = await render(SwitchWithThumb);
    const thumb = page.getByTestId("thumb");
    await expect.element(thumb).toHaveAttribute("data-unchecked");
    await expect.element(thumb).not.toHaveAttribute("data-checked");
    await expect.element(thumb).not.toHaveAttribute("data-disabled");

    await rerender({ checked: true, disabled: true, readOnly: true, required: true });
    await expect.element(thumb).toHaveAttribute("data-checked");
    await expect.element(thumb).not.toHaveAttribute("data-unchecked");
    await expect.element(thumb).toHaveAttribute("data-disabled");
    await expect.element(thumb).toHaveAttribute("data-readonly");
    await expect.element(thumb).toHaveAttribute("data-required");
  });

  it("follows the root when the user toggles it", async () => {
    await render(SwitchWithThumb);
    const thumb = page.getByTestId("thumb");
    await expect.element(thumb).toHaveAttribute("data-unchecked");

    await userEvent.click(page.getByRole("switch"));

    await expect.element(thumb).toHaveAttribute("data-checked");
  });

  it("keeps ids unique and labels scoped across several hydrated switches", () => {
    const html = severalHtml["../__ssr__/several.html"];
    if (html === undefined) {
      throw new Error(
        "tests/switch/__ssr__/several.html is missing. Run the Node project to write it.",
      );
    }
    const names = ["first", "second", "third"];
    const inputs = (container: HTMLElement) =>
      names.map((name) => container.querySelector<HTMLInputElement>(`input[id="${name}"]`)!);

    const { before, after } = ssrHydration(SeveralSwitches, {}, html, (container) => {
      const all = inputs(container);
      expect(all.every(Boolean)).toBe(true);
      for (const [index, name] of names.entries()) {
        container.querySelector<HTMLLabelElement>(`label[for="${name}"]`)!.click();
        flushSync();
        // Only the clicked label's switch is on, and the earlier ones stay as they were.
        expect(all.map((input) => input.checked)).toEqual(names.map((_, i) => i <= index));
        const roots = container.querySelectorAll('[role="switch"]');
        expect(Array.from(roots, (root) => root.getAttribute("aria-checked"))).toEqual([
          ...names.map((_, i) => String(i <= index)),
          "false",
        ]);
      }
    });

    const ids = after.map((element) => element.id).filter(Boolean);
    // The inputs, plus whatever ids the switches generate for their labels.
    expect(ids).toEqual(expect.arrayContaining(names));
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    // Hydration keeps the server's ids. (It adds ids to the labels, which the switches use to name
    // themselves, so the two snapshots aren't equal.)
    expect(after.map((element) => element.id)).toEqual(
      expect.arrayContaining(before.map((element) => element.id).filter(Boolean)),
    );
  });
});

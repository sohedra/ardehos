import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import type { ComponentEvent } from "#lib/internals/types.js";
import ConformanceHarness from "../fixtures/ConformanceHarness.svelte";
import {
  harnessProps,
  serverRenderProps,
  type ConformanceSetup,
  type HarnessOptions,
} from "./conformanceSetup.js";
import { ssrHydration } from "./ssrHydration.js";

const RENDER_WITH_CHILDREN_WARNING =
  "The children of a part are ignored when the render snippet is used. Put the content inside the render snippet instead.";

const serverHtml = import.meta.glob<string>("./__ssr__/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * The conformance suite every part runs in the browser. Pair it with `describeServerRender`
 * (same `name` and `setup`) in a Node test, which writes the HTML the hydration test uses.
 */
export function describeConformance<State>(name: string, setup: () => ConformanceSetup<State>) {
  describe(`${name} conformance`, () => {
    async function renderPart(options: HarnessOptions = {}) {
      const base = setup();
      const result = await render(ConformanceHarness, {
        props: harnessProps(base, options),
      });
      return {
        ...result,
        part: result.getByTestId("part"),
        getRef: () => result.component.getRef(),
        update: (next: HarnessOptions) => result.rerender(harnessProps(base, next)),
      };
    }

    it("renders its default element", async () => {
      const { part } = await renderPart();
      await expect.element(part).toBeInTheDocument();
      expect(part.element().tagName.toLowerCase()).toBe(setup().defaultTag);
    });

    it("forwards extra props", async () => {
      const { getByTestId } = await renderPart({
        partProps: { "data-testid": "forwarded", "aria-label": "Label", id: "custom-id" },
      });
      const part = getByTestId("forwarded");
      await expect.element(part).toHaveAttribute("aria-label", "Label");
      await expect.element(part).toHaveAttribute("id", "custom-id");
    });

    it("merges user handlers before its own and honours preventComponentHandler", async () => {
      const { readOwnClick } = setup();
      const calls: string[] = [];
      let prevent = true;
      const onclick = (event: ComponentEvent<MouseEvent>) => {
        calls.push("user");
        if (prevent) {
          event.preventComponentHandler();
        }
      };
      // Children give the element a size, so it can be clicked.
      const { part } = await renderPart({ withChildren: true, partProps: { onclick } });
      await expect.element(part).toBeInTheDocument();
      const initial = readOwnClick?.(part.element());

      await userEvent.click(part);
      flushSync();
      expect(calls).toEqual(["user"]);
      if (readOwnClick) {
        expect(readOwnClick(part.element())).toEqual(initial);
      }

      prevent = false;
      await userEvent.click(part);
      flushSync();
      expect(calls).toEqual(["user", "user"]);
      if (readOwnClick) {
        expect(readOwnClick(part.element())).not.toEqual(initial);
      }
    });

    it("accepts class as a value or a function of state", async () => {
      const { state } = setup();
      const byState = (s: State) => (state.isOn(s) ? "on" : "off");
      const { part, update } = await renderPart({ partProps: { class: "a" } });
      await expect.element(part).toHaveClass("a");

      await update({ partProps: { ...state.on, class: byState } });
      await expect.element(part).toHaveClass("on");

      await update({ partProps: { ...state.off, class: byState } });
      await expect.element(part).toHaveClass("off");
      await expect.element(part).not.toHaveClass("on");
    });

    it("accepts style as a value or a function of state", async () => {
      const { state } = setup();
      const byState = (s: State) =>
        state.isOn(s) ? "color: rgb(0, 128, 0)" : "color: rgb(0, 0, 255)";
      const { part, update } = await renderPart({
        partProps: { style: "color: rgb(255, 0, 0)" },
      });
      await expect.element(part).toHaveStyle({ color: "rgb(255, 0, 0)" });

      await update({ partProps: { ...state.on, style: byState } });
      await expect.element(part).toHaveStyle({ color: "rgb(0, 128, 0)" });

      await update({ partProps: { ...state.off, style: byState } });
      await expect.element(part).toHaveStyle({ color: "rgb(0, 0, 255)" });
    });

    it("renders state as data attributes", async () => {
      const { state } = setup();
      const { part, update } = await renderPart({ partProps: state.on });
      await expect.element(part).toHaveAttribute(state.attribute);

      await update({ partProps: state.off });
      await expect.element(part).not.toHaveAttribute(state.attribute);
    });

    it("exposes the element through bind:ref", async () => {
      const { part, getRef } = await renderPart();
      await expect.element(part).toBeInTheDocument();
      expect(getRef()).toBe(part.element());
    });

    it("passes attachments on the part through to the element", async () => {
      const attach = vi.fn();
      const { part } = await renderPart({ attach });
      await expect.element(part).toBeInTheDocument();
      expect(attach).toHaveBeenCalledWith(part.element());
    });

    it("replaces the element with the render snippet", async () => {
      const { state } = setup();
      const { part, getRef } = await renderPart({ render: "button", partProps: state.on });
      await expect.element(part).toBeInTheDocument();
      expect(part.element().tagName).toBe("BUTTON");
      await expect.element(part).toHaveAttribute(state.attribute);
      expect(getRef()).toBe(part.element());
    });

    it("passes state to the children snippet", async () => {
      const { state } = setup();
      const { part, getByTestId, update } = await renderPart({
        withChildren: true,
        partProps: state.on,
      });
      const children = getByTestId("children");
      await expect.element(children).toHaveTextContent("on");
      expect(part.element().contains(children.element())).toBe(true);

      await update({ withChildren: true, partProps: state.off });
      await expect.element(children).toHaveTextContent("off");
    });

    it("ignores children and warns in development when render is also given", async () => {
      const { state } = setup();
      // Silenced: the warning is expected, and test output stays clean.
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const { part, getByTestId, update } = await renderPart({
          render: "button",
          withChildren: true,
          partProps: state.on,
        });
        await expect.element(part).toBeInTheDocument();
        await expect.element(getByTestId("children")).not.toBeInTheDocument();

        await update({ render: "button", withChildren: true, partProps: state.off });
        await expect.element(part).not.toHaveAttribute(state.attribute);
        const warnings = warn.mock.calls.filter((args) => args[0] === RENDER_WITH_CHILDREN_WARNING);
        expect(warnings).toHaveLength(1);
      } finally {
        warn.mockRestore();
      }
    });

    it("survives server rendering and hydration", () => {
      const html = serverHtml[`./__ssr__/${name}.html`];
      if (html === undefined) {
        throw new Error(
          `tests/conformance/__ssr__/${name}.html is missing. Run describeServerRender("${name}", …) in the Node project to write it.`,
        );
      }
      const { state } = setup();
      const { before, after } = ssrHydration(ConformanceHarness, serverRenderProps(setup()), html);
      expect(before).toContainEqual(
        expect.objectContaining({ data: expect.objectContaining({ "data-testid": "part" }) }),
      );
      expect(before).toContainEqual(
        expect.objectContaining({
          data: expect.objectContaining({ [state.attribute]: expect.any(String) }),
        }),
      );
      expect(after).toEqual(before);
    });

    it("does not throw when the render snippet ignores props", async () => {
      const { getByText, getRef } = await renderPart({ render: "ignore-props" });
      await expect.element(getByText("x")).toBeInTheDocument();
      expect(getRef()).toBeNull();
    });

    it("keeps state and moves the ref when render is toggled", async () => {
      const { state, readOwnClick, defaultTag } = setup();
      // A size, so the element can be clicked without children (which the render snippet ignores).
      const style = "display: inline-block; width: 16px; height: 16px";
      const { part, getRef, component } = await renderPart({
        partProps: { ...(readOwnClick ? state.off : state.on), style },
      });
      if (readOwnClick) {
        // Turn the state on through the part itself, so only the part holds it.
        await expect.element(part).not.toHaveAttribute(state.attribute);
        await userEvent.click(part);
      }
      await expect.element(part).toHaveAttribute(state.attribute);
      expect(getRef()).toBe(part.element());

      component.setRender("button");
      flushSync();
      await expect.element(part).toHaveAttribute(state.attribute);
      expect(part.element().tagName).toBe("BUTTON");
      expect(getRef()).toBe(part.element());

      component.setRender(undefined);
      flushSync();
      await expect.element(part).toHaveAttribute(state.attribute);
      expect(part.element().tagName.toLowerCase()).toBe(defaultTag);
      expect(getRef()).toBe(part.element());
    });
  });
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import ButtonFixture from "../../fixtures/ButtonFixture.svelte";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useButton", () => {
  describe("non-native button", () => {
    it("gets role and tabindex, and no type", async () => {
      await render(ButtonFixture);
      const el = page.getByTestId("button").element();
      expect(el.getAttribute("role")).toBe("button");
      expect(el.getAttribute("tabindex")).toBe("0");
      expect(el.hasAttribute("type")).toBe(false);
    });

    it.each([{ key: "Enter" }, { key: "Space" }])(
      "can be activated with $key key",
      async ({ key }) => {
        const onclick = vi.fn();
        await render(ButtonFixture, { onclick });
        await userEvent.keyboard("[Tab]");
        await expect.element(page.getByTestId("button")).toHaveFocus();
        await userEvent.keyboard(`[${key}]`);
        expect(onclick).toHaveBeenCalledTimes(1);
      },
    );

    it("fires Enter click on keydown and Space click on keyup", async () => {
      const onclick = vi.fn();
      await render(ButtonFixture, { onclick });
      const el = page.getByTestId("button").element() as HTMLElement;
      el.focus();

      el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
      expect(onclick).toHaveBeenCalledTimes(0);
      el.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true }));
      expect(onclick).toHaveBeenCalledTimes(1);

      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
      );
      expect(onclick).toHaveBeenCalledTimes(2);
    });

    it("can be activated with Enter when the keyboard event originates inside a shadow root", async () => {
      const onclick = vi.fn();
      await render(ButtonFixture, { onclick });
      const host = page.getByTestId("button").element() as HTMLElement;
      const inner = document.createElement("span");
      inner.tabIndex = 0;
      host.attachShadow({ mode: "open" }).appendChild(inner);

      inner.focus();
      inner.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }),
      );
      expect(onclick).toHaveBeenCalledTimes(1);
    });

    it("does not click when the consumer calls preventComponentHandler", async () => {
      const onclick = vi.fn();
      const prevent = (event: Event) =>
        (event as Event & { preventComponentHandler(): void }).preventComponentHandler();
      await render(ButtonFixture, { onclick, onkeydown: prevent, onkeyup: prevent });
      const el = page.getByTestId("button").element() as HTMLElement;
      el.focus();
      const fire = (type: string, key: string) =>
        el.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));

      fire("keydown", "Enter");
      fire("keydown", " ");
      fire("keyup", " ");
      expect(onclick).toHaveBeenCalledTimes(0);
    });

    it("does not click on Enter when keydown is default-prevented", async () => {
      const onclick = vi.fn();
      await render(ButtonFixture, { onclick, onkeydown: (e: Event) => e.preventDefault() });
      await userEvent.keyboard("[Tab]");
      await userEvent.keyboard("[Enter]");
      expect(onclick).toHaveBeenCalledTimes(0);
    });

    it("does not click on Space when keyup is default-prevented", async () => {
      const onclick = vi.fn();
      await render(ButtonFixture, { onclick, onkeyup: (e: Event) => e.preventDefault() });
      await userEvent.keyboard("[Tab]");
      await userEvent.keyboard("[Space]");
      expect(onclick).toHaveBeenCalledTimes(0);
    });

    it("passes arbitrary props through", async () => {
      await render(ButtonFixture, { "data-extra": "x" });
      await expect.element(page.getByTestId("button")).toHaveAttribute("data-extra", "x");
    });

    it("sets aria-disabled and ignores click and keys when disabled", async () => {
      const onclick = vi.fn();
      const onkeydown = vi.fn();
      const onkeyup = vi.fn();
      await render(ButtonFixture, { disabled: true, onclick, onkeydown, onkeyup });
      const el = page.getByTestId("button");
      await expect.element(el).toHaveAttribute("aria-disabled", "true");
      await expect.element(el).toHaveAttribute("tabindex", "-1");

      const node = el.element() as HTMLElement;
      node.focus();
      node.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      for (const key of ["Enter", " "]) {
        node.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
        node.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true }));
      }
      expect(onclick).toHaveBeenCalledTimes(0);
      expect(onkeydown).toHaveBeenCalledTimes(0);
      expect(onkeyup).toHaveBeenCalledTimes(0);
    });
  });

  describe("native button", () => {
    it("sets type=button and the disabled attribute", async () => {
      await render(ButtonFixture, { tag: "button", native: true, disabled: true });
      const el = page.getByTestId("button");
      await expect.element(el).toHaveAttribute("type", "button");
      await expect.element(el).toBeDisabled();
      expect(el.element().hasAttribute("role")).toBe(false);
    });

    it("uses a custom tabIndex", async () => {
      await render(ButtonFixture, { tag: "button", native: true, tabIndex: 3 });
      expect((page.getByTestId("button").element() as HTMLElement).tabIndex).toBe(3);
    });
  });

  describe("focusableWhenDisabled", () => {
    it("keeps a disabled native button focusable via aria-disabled", async () => {
      await render(ButtonFixture, {
        tag: "button",
        native: true,
        disabled: true,
        focusableWhenDisabled: true,
      });
      const el = page.getByTestId("button");
      await expect.element(el).toHaveAttribute("aria-disabled", "true");
      expect(el.element().hasAttribute("disabled")).toBe(false);
      await userEvent.keyboard("[Tab]");
      await expect.element(el).toHaveFocus();
    });

    it("prevents interactions except focus and blur on a non-native button", async () => {
      const onclick = vi.fn();
      const onkeydown = vi.fn();
      const onkeyup = vi.fn();
      const onfocus = vi.fn();
      const onblur = vi.fn();
      await render(ButtonFixture, {
        disabled: true,
        focusableWhenDisabled: true,
        onclick,
        onkeydown,
        onkeyup,
        onfocus,
        onblur,
      });
      const el = page.getByTestId("button");

      await userEvent.keyboard("[Tab]");
      await expect.element(el).toHaveFocus();
      expect(onfocus).toHaveBeenCalledTimes(1);

      await userEvent.keyboard("[Enter]");
      await userEvent.keyboard("[Space]");
      expect(onkeydown).toHaveBeenCalledTimes(0);
      expect(onkeyup).toHaveBeenCalledTimes(0);
      expect(onclick).toHaveBeenCalledTimes(0);

      await userEvent.keyboard("[Tab]");
      expect(onblur).toHaveBeenCalledTimes(1);
    });
  });

  describe("dev checks", () => {
    it("errors if native is true but the element is not a button", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await render(ButtonFixture, { tag: "span", native: true });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        "A component that acts as a button expected a native <button> because the " +
          "`nativeButton` prop is true. Rendering a non-<button> removes native button " +
          "semantics, which can impact forms and accessibility. Use a real <button> in the " +
          "`render` prop, or set `nativeButton` to `false`.",
      );
    });

    it("errors if native is false but the element is a button", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await render(ButtonFixture, { tag: "button", native: false });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        "A component that acts as a button expected a non-<button> because the `nativeButton` " +
          "prop is false. Rendering a <button> keeps native behavior while the component applies " +
          "non-native attributes and handlers, which can add unintended extra attributes (such " +
          "as `role` or `aria-disabled`). Use a non-<button> in the `render` prop, or set " +
          "`nativeButton` to `true`.",
      );
    });

    it("does not error for matching element and native flag", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await render(ButtonFixture, { tag: "button", native: true });
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});

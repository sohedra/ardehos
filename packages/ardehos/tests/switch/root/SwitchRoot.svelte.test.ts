import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
import type { SwitchRootChangeEventDetails } from "#lib/switch/root/types.js";
import { describeConformance } from "../../conformance/describeConformance.js";
import SwitchRootBound from "../fixtures/SwitchRootBound.svelte";
import SwitchRootContextValue from "../fixtures/SwitchRootContextValue.svelte";
import SwitchRootFunctionBound from "../fixtures/SwitchRootFunctionBound.svelte";
import SwitchRootInLabel from "../fixtures/SwitchRootInLabel.svelte";
import SwitchRootInputRef from "../fixtures/SwitchRootInputRef.svelte";
import SwitchRootInParent from "../fixtures/SwitchRootInParent.svelte";
import SwitchRootPreventHandler from "../fixtures/SwitchRootPreventHandler.svelte";
import SwitchRootParentValue from "../fixtures/SwitchRootParentValue.svelte";
import SwitchRootToggleFromOutside from "../fixtures/SwitchRootToggleFromOutside.svelte";
import SwitchRootWithContextValue from "../fixtures/SwitchRootWithContextValue.svelte";
import SwitchRootWithLabels from "../fixtures/SwitchRootWithLabels.svelte";
import { switchRootConformance } from "../fixtures/switchRootConformance.js";

afterEach(() => {
  vi.restoreAllMocks();
});

// An empty switch has no size, and userEvent only clicks visible elements.
const SIZED = "display: inline-block; width: 16px; height: 16px";

function getSwitch() {
  return page.getByRole("switch");
}

function switchElement() {
  return getSwitch().element() as HTMLElement;
}

function hiddenInput() {
  return document.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
}

describeConformance("Switch.Root", () => switchRootConformance);

describe("Switch.Root", () => {
  describe("interactions", () => {
    it("should change its state when clicked", async () => {
      await render(SwitchRoot);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      switchElement().click();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("should update its state when changed from outside", async () => {
      await render(SwitchRootToggleFromOutside);
      const button = page.getByText("Toggle");
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      await userEvent.click(button);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

      await userEvent.click(button);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
    });

    it("should update its state if the underlying input is toggled", async () => {
      await render(SwitchRoot);

      hiddenInput().click();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("ignores a hidden input click canceled before the component handles it", async () => {
      const onCheckedChange = vi.fn();
      await render(SwitchRoot, { onCheckedChange });
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      event.preventDefault();

      hiddenInput().dispatchEvent(event);
      flushSync();

      expect(onCheckedChange).not.toHaveBeenCalled();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it.each([{ key: "Enter" }, { key: "Space" }])(
      "can be activated with $key key",
      async ({ key }) => {
        await render(SwitchRoot);
        await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

        await userEvent.keyboard("[Tab]");
        await expect.element(getSwitch()).toHaveFocus();

        await userEvent.keyboard(`[${key}]`);
        await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      },
    );

    it("starts from defaultChecked when checked isn't given", async () => {
      await render(SwitchRoot, { defaultChecked: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
    });

    it("follows a parent's new checked value after a local toggle", async () => {
      const { component } = await render(SwitchRootParentValue);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      await userEvent.click(getSwitch());
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

      // Like a native checkbox's `checked={x}`, re-setting the parent's unchanged value is no change.
      component.setChecked(false);
      flushSync();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

      component.setChecked(true);
      flushSync();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

      component.setChecked(false);
      flushSync();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      component.setChecked(true);
      flushSync();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("bind:checked", () => {
    it("writes the new value through bind:checked", async () => {
      const { getByTestId } = await render(SwitchRootBound, { initial: false, style: SIZED });
      await expect.element(getByTestId("bound")).toHaveTextContent("false");

      await userEvent.click(getSwitch());

      await expect.element(getByTestId("bound")).toHaveTextContent("true");
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("writes defaultChecked to a bound undefined value", async () => {
      const { getByTestId } = await render(SwitchRootBound, { defaultChecked: true });
      await expect.element(getByTestId("bound")).toHaveTextContent("true");
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("does not call the bound setter when onCheckedChange cancels", async () => {
      const set = vi.fn();
      await render(SwitchRootFunctionBound, {
        get: () => false,
        set,
        style: SIZED,
        onCheckedChange: (_checked: boolean, details: SwitchRootChangeEventDetails) =>
          details.cancel(),
      });

      await userEvent.click(getSwitch());
      flushSync();

      expect(set).toHaveBeenCalledTimes(0);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it("keeps the hidden input in sync when a function-binding setter declines", async () => {
      const set = vi.fn();
      await render(SwitchRootFunctionBound, { get: () => false, set, style: SIZED });

      await userEvent.click(getSwitch());
      flushSync();

      expect(set).toHaveBeenCalledWith(true);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it("runs onCheckedChange before the bound setter", async () => {
      const calls: string[] = [];
      let value = false;
      await render(SwitchRootFunctionBound, {
        get: () => value,
        set: (next: boolean) => {
          calls.push("setter");
          value = next;
        },
        style: SIZED,
        onCheckedChange: () => calls.push("onCheckedChange"),
      });

      await userEvent.click(getSwitch());

      expect(calls).toEqual(["onCheckedChange", "setter"]);
    });
  });

  describe("extra props", () => {
    it("should override the built-in attributes", async () => {
      const { getByTestId } = await render(SwitchRoot, {
        role: "checkbox",
        "data-testid": "switch",
      });
      await expect.element(getByTestId("switch")).toHaveAttribute("role", "checkbox");
    });

    it("sets `aria-labelledby` from a sibling label associated with the hidden input", async () => {
      await render(SwitchRootWithLabels, {
        labels: [{ for: "switch-input", text: "Label" }],
        id: "switch-input",
      });

      const label = page.getByText("Label").element();
      await expect.element(getSwitch()).toHaveAttribute("aria-labelledby");
      expect(label.id).not.toBe("");
      await expect.element(getSwitch()).toHaveAttribute("aria-labelledby", label.id);
    });

    it("updates fallback `aria-labelledby` when the hidden input id changes", async () => {
      const labels = [
        { for: "switch-input-a", text: "Label A" },
        { for: "switch-input-b", text: "Label B" },
      ];
      const { rerender } = await render(SwitchRootWithLabels, { labels, id: "switch-input-a" });

      const labelA = page.getByText("Label A").element();
      await expect.element(getSwitch()).toHaveAttribute("aria-labelledby");
      expect(labelA.id).not.toBe("");
      await expect.element(getSwitch()).toHaveAttribute("aria-labelledby", labelA.id);

      await rerender({ labels, id: "switch-input-b" });

      const labelB = page.getByText("Label B").element();
      await expect.element(getSwitch()).not.toHaveAttribute("aria-labelledby", labelA.id);
      expect(labelB.id).not.toBe("");
      expect(labelB.id).not.toBe(labelA.id);
      await expect.element(getSwitch()).toHaveAttribute("aria-labelledby", labelB.id);
    });

    it("prefers `aria-label` over an associated label", async () => {
      await render(SwitchRootInLabel, { "aria-label": "Wi-Fi", text: "Wi-Fi" });

      await expect.element(getSwitch()).not.toHaveAttribute("aria-labelledby");
      await expect.element(getSwitch()).toHaveAccessibleName("Wi-Fi");
    });
  });

  describe("prop: onCheckedChange", () => {
    it("should call onCheckedChange when clicked", async () => {
      const onCheckedChange = vi.fn();
      await render(SwitchRoot, { onCheckedChange });

      switchElement().click();

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange.mock.calls[0][0]).toBe(true);
      expect(onCheckedChange.mock.calls[0][1].reason).toBe("none");
    });

    it("should report keyboard modifier event properties when calling onCheckedChange", async () => {
      const onCheckedChange = vi.fn(
        (_checked: boolean, details: SwitchRootChangeEventDetails) => details,
      );
      await render(SwitchRoot, { onCheckedChange, style: SIZED });

      await userEvent.keyboard("{Shift>}");
      await userEvent.click(getSwitch());
      await userEvent.keyboard("{/Shift}");

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      const details = onCheckedChange.mock.results[0]!.value as SwitchRootChangeEventDetails;
      expect((details.event as MouseEvent).shiftKey).toBe(true);
    });

    it("does not change state when canceled via a root click", async () => {
      await render(SwitchRoot, {
        style: SIZED,
        onCheckedChange: (_checked: boolean, details: SwitchRootChangeEventDetails) =>
          details.cancel(),
      });

      await userEvent.click(getSwitch());
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it("does not change state when canceled via a hidden input click", async () => {
      await render(SwitchRoot, {
        onCheckedChange: (_checked: boolean, details: SwitchRootChangeEventDetails) =>
          details.cancel(),
      });

      // The input is visually hidden (1px, clipped), so it's clicked directly.
      hiddenInput().click();
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });
  });

  describe("prop: onclick", () => {
    it("should call onclick when clicked", async () => {
      const onclick = vi.fn();
      await render(SwitchRoot, { onclick });

      switchElement().click();

      expect(onclick).toHaveBeenCalledTimes(1);
    });

    it("lets onclick skip the switch's handler with preventComponentHandler()", async () => {
      await render(SwitchRootPreventHandler);

      await userEvent.click(getSwitch());

      await expect.element(getSwitch()).toHaveAttribute("data-prevented", "true");
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
    });

    it.each([false, true])(
      "propagates a single click event to ancestors per user click (nativeButton=%s)",
      async (nativeButton) => {
        const onParentClick = vi.fn();
        await render(SwitchRootInParent, {
          onParentClick,
          nativeButton,
          renderButton: nativeButton,
        });

        switchElement().click();

        expect(onParentClick).toHaveBeenCalledTimes(1);
        await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      },
    );

    it.each([false, true])(
      "does not propagate to ancestors when stopPropagation() is called (nativeButton=%s)",
      async (nativeButton) => {
        const onParentClick = vi.fn();
        await render(SwitchRootInParent, {
          onParentClick,
          nativeButton,
          renderButton: nativeButton,
          onclick: (event: MouseEvent) => event.stopPropagation(),
        });

        switchElement().click();

        expect(onParentClick).toHaveBeenCalledTimes(0);
        await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      },
    );
  });

  describe("native input and change events", () => {
    function listen(container: HTMLElement) {
      const events: { type: string; target: EventTarget | null; bubbles: boolean }[] = [];
      const record = (event: Event) =>
        events.push({ type: event.type, target: event.target, bubbles: event.bubbles });
      container.addEventListener("input", record);
      container.addEventListener("change", record);
      return events;
    }

    it("fires bubbling input and change from the hidden input on an accepted change", async () => {
      const { container } = await render(SwitchRoot, { style: SIZED });
      const events = listen(container);

      await userEvent.click(getSwitch());

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      expect(events).toEqual([
        { type: "input", target: hiddenInput(), bubbles: true },
        { type: "change", target: hiddenInput(), bubbles: true },
      ]);
    });

    it("fires neither when onCheckedChange cancels", async () => {
      const { container } = await render(SwitchRoot, {
        style: SIZED,
        onCheckedChange: (_checked: boolean, details: SwitchRootChangeEventDetails) =>
          details.cancel(),
      });
      const events = listen(container);

      await userEvent.click(getSwitch());
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(events).toEqual([]);
    });

    it("fires neither when a function-binding setter declines", async () => {
      const set = vi.fn();
      const { container } = await render(SwitchRootFunctionBound, {
        get: () => false,
        set,
        style: SIZED,
      });
      const events = listen(container);

      await userEvent.click(getSwitch());
      flushSync();

      expect(set).toHaveBeenCalledWith(true);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(events).toEqual([]);
    });
  });

  describe("prop: disabled", () => {
    it("uses aria-disabled instead of HTML disabled", async () => {
      await render(SwitchRoot, { disabled: true });
      await expect.element(getSwitch()).not.toHaveAttribute("disabled");
      await expect.element(getSwitch()).toHaveAttribute("aria-disabled", "true");
    });

    it("should not have the `disabled` attribute when `disabled` is not set", async () => {
      await render(SwitchRoot);
      await expect.element(getSwitch()).not.toHaveAttribute("disabled");
    });

    it("should not change its state when clicked", async () => {
      await render(SwitchRoot, { disabled: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      switchElement().click();
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("prop: readOnly", () => {
    it("should have the `aria-readonly` attribute", async () => {
      await render(SwitchRoot, { readOnly: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-readonly", "true");
    });

    it("should not have the aria attribute when `readOnly` is not set", async () => {
      await render(SwitchRoot);
      await expect.element(getSwitch()).not.toHaveAttribute("aria-readonly");
    });

    it("should not change its state when clicked", async () => {
      await render(SwitchRoot, { readOnly: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      switchElement().click();
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
    });

    it("should not change its state when its label is clicked", async () => {
      const { getByTestId } = await render(SwitchRootInLabel, { readOnly: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      (getByTestId("label").element() as HTMLElement).click();
      flushSync();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });
  });

  describe("prop: required", () => {
    it("should have the `aria-required` attribute", async () => {
      await render(SwitchRoot, { required: true });
      await expect.element(getSwitch()).toHaveAttribute("aria-required", "true");
    });

    it("should not have the aria attribute when `required` is not set", async () => {
      await render(SwitchRoot);
      await expect.element(getSwitch()).not.toHaveAttribute("aria-required");
    });
  });

  describe("prop: inputRef", () => {
    it("should be able to access the native input", async () => {
      const { component } = await render(SwitchRootInputRef);

      expect(component.getInputRef()).toBe(hiddenInput());
    });
  });

  it("should place the style hooks on the root", async () => {
    const { rerender } = await render(SwitchRoot, {
      defaultChecked: true,
      disabled: true,
      readOnly: true,
      required: true,
    });

    await expect.element(getSwitch()).toHaveAttribute("data-checked", "");
    await expect.element(getSwitch()).toHaveAttribute("data-disabled", "");
    await expect.element(getSwitch()).toHaveAttribute("data-readonly", "");
    await expect.element(getSwitch()).toHaveAttribute("data-required", "");

    await rerender({ disabled: false, readOnly: false });
    switchElement().click();

    await expect.element(getSwitch()).toHaveAttribute("data-unchecked", "");
    await expect.element(getSwitch()).not.toHaveAttribute("data-checked");
  });

  it("shares its state with parts through SwitchRootContext", async () => {
    const { getByTestId } = await render(SwitchRootWithContextValue, { style: SIZED });
    await expect.element(getByTestId("context")).toHaveTextContent("unchecked");

    await userEvent.click(getSwitch());

    await expect.element(getByTestId("context")).toHaveTextContent("checked");
    await expect.element(getByTestId("context")).not.toHaveTextContent("unchecked");
  });

  it("throws SwitchRootContext's message outside Switch.Root", async () => {
    await expect(render(SwitchRootContextValue)).rejects.toThrow(
      "SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.",
    );
  });

  it("should set the name attribute only on the input", async () => {
    await render(SwitchRoot, { name: "switch-name" });

    expect(hiddenInput()).toHaveAttribute("name", "switch-name");
    await expect.element(getSwitch()).not.toHaveAttribute("name");
  });

  it("should not set the value attribute by default", async () => {
    await render(SwitchRoot);

    expect(hiddenInput()).not.toHaveAttribute("value");
  });

  it("should set the value attribute only on the input", async () => {
    await render(SwitchRoot, { value: "1" });

    expect(hiddenInput()).toHaveAttribute("value", "1");
    await expect.element(getSwitch()).not.toHaveAttribute("value");
  });

  it("renders the uncheckedValue input only while unchecked", async () => {
    const { container } = await render(SwitchRoot, {
      name: "switch-name",
      uncheckedValue: "off",
      style: SIZED,
    });
    const uncheckedInput = () => container.querySelector('input[type="hidden"]');
    expect(uncheckedInput()).toHaveAttribute("name", "switch-name");
    expect(uncheckedInput()).toHaveAttribute("value", "off");

    await userEvent.click(getSwitch());

    await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    expect(uncheckedInput()).toBeNull();
  });

  it("renders no text beside the switch", async () => {
    const { container } = await render(SwitchRoot, { name: "switch-name", uncheckedValue: "off" });
    expect(container.textContent).toBe("");
  });

  describe("with native <label>", () => {
    it("should toggle the switch when a wrapping <label> is clicked", async () => {
      const { getByTestId } = await render(SwitchRootInLabel);
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      await userEvent.click(getByTestId("label"));

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("should toggle the switch when an explicitly linked <label> is clicked", async () => {
      await render(SwitchRootWithLabels, {
        labels: [{ for: "mySwitch", text: "Toggle" }],
        id: "mySwitch",
      });
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

      await userEvent.click(page.getByText("Toggle"));

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });

    it("should associate `id` with the native button when `nativeButton=true`", async () => {
      await render(SwitchRootWithLabels, {
        labels: [{ for: "mySwitch", text: "Toggle" }],
        id: "mySwitch",
        nativeButton: true,
        renderButton: true,
      });

      await expect.element(getSwitch()).toHaveAttribute("id", "mySwitch");
      expect(hiddenInput()).not.toHaveAttribute("id", "mySwitch");

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      await userEvent.click(page.getByText("Toggle"));
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
    });
  });

  it("can render a native button", async () => {
    const { container } = await render(SwitchRootInParent, {
      nativeButton: true,
      renderButton: true,
    });

    await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
    expect(container.querySelector("button")).toBe(switchElement());

    await userEvent.keyboard("[Tab]");
    await expect.element(getSwitch()).toHaveFocus();

    await userEvent.keyboard("[Enter]");
    await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("[Space]");
    await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");

    await userEvent.click(getSwitch());
    await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
  });
});

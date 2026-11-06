import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import FormFixture from "../fixtures/FormFixture.svelte";

// An empty switch has no size, and userEvent only clicks visible elements.
const SIZED = "display: inline-block; width: 16px; height: 16px";

/**
 * An `onFormSubmit` spy returning the form's entry for `name` (`null` when absent). Read it with
 * `spy.mock.results.at(-1)?.value`. Base UI's `createFormDataSpy`, for a plain `<form>`.
 */
function createFormDataSpy(name: string) {
  return vi.fn((event: SubmitEvent) =>
    new FormData(event.currentTarget as HTMLFormElement).get(name),
  );
}

function getSwitch() {
  return page.getByRole("switch");
}

function submitButton() {
  return page.getByRole("button", { name: "Submit" });
}

function hiddenInput() {
  return document.querySelector<HTMLInputElement>('input[type="checkbox"][aria-hidden="true"]')!;
}

function getForm() {
  return document.querySelector("form")!;
}

describe("Switch.Root in a form", () => {
  describe("submission", () => {
    it("should include the switch value in form submission, matching native checkbox behavior", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, { name: "test-switch", style: SIZED, onFormSubmit: submitSpy });

      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe(null);

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(2);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("on");
    });

    it("submits to an external form when `form` is provided", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        form: "external-form",
        style: SIZED,
        onFormSubmit: submitSpy,
      });
      expect(getSwitch().element().closest("form")).toBe(null);

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("on");
    });

    it("submits uncheckedValue to an external form when off", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        form: "external-form",
        uncheckedValue: "off",
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("off");
    });

    it("does not submit uncheckedValue when disabled", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        uncheckedValue: "off",
        disabled: true,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe(null);
    });

    it("matches native checkbox form submission behavior", async () => {
      const submitSpy = vi.fn((event: SubmitEvent) => {
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        return {
          native: { get: formData.get("native"), getAll: formData.getAll("native") },
          custom: { get: formData.get("custom"), getAll: formData.getAll("custom") },
        };
      });
      await render(FormFixture, {
        name: "custom",
        nativeCheckbox: "native",
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual({
        native: { get: null, getAll: [] },
        custom: { get: null, getAll: [] },
      });

      await userEvent.click(page.getByRole("checkbox"));
      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual({
        native: { get: "on", getAll: ["on"] },
        custom: { get: "on", getAll: ["on"] },
      });
    });

    it("should submit uncheckedValue when switch is off and uncheckedValue is specified", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        uncheckedValue: "off",
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("off");

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(2);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("on");

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(3);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("off");
    });

    it("should submit custom uncheckedValue when switch is off", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        uncheckedValue: "false",
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("false");

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(2);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("on");
    });

    it("submits custom value and uncheckedValue across an off/on/off cycle", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        value: "yes",
        uncheckedValue: "no",
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());
      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("no");

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());
      expect(submitSpy.mock.calls.length).toBe(2);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("yes");

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());
      expect(submitSpy.mock.calls.length).toBe(3);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("no");
    });

    it("triggers native HTML validation on submit", async () => {
      const submitSpy = createFormDataSpy("test-switch");
      await render(FormFixture, {
        name: "test-switch",
        required: true,
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await userEvent.click(submitButton());

      expect(submitSpy).not.toHaveBeenCalled();
      expect(hiddenInput().validity.valueMissing).toBe(true);

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());

      expect(submitSpy.mock.calls.length).toBe(1);
      expect(submitSpy.mock.results.at(-1)?.value).toBe("on");
    });

    it("updates submitted data when name or uncheckedValue change after mount", async () => {
      const submitSpy = vi.fn((event: SubmitEvent) =>
        Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)),
      );
      const { rerender } = await render(FormFixture, {
        name: "before",
        uncheckedValue: "off",
        style: SIZED,
        onFormSubmit: submitSpy,
      });

      await rerender({ name: "after", uncheckedValue: "no" });
      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual({ after: "no" });

      await userEvent.click(getSwitch());
      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual({ after: "on" });
    });

    it("fires a bubbling input event on the form when the switch changes", async () => {
      await render(FormFixture, { name: "test-switch", style: SIZED });
      const targets: (EventTarget | null)[] = [];
      getForm().addEventListener("input", (event) => targets.push(event.target));

      await userEvent.click(getSwitch());

      expect(targets).toEqual([hiddenInput()]);
    });
  });

  describe("reset", () => {
    it.each([
      ["form.reset()", () => getForm().reset()],
      ["a reset button", () => userEvent.click(page.getByRole("button", { name: "Reset" }))],
    ])("restores defaultChecked on form reset through %s", async (_, reset) => {
      await render(FormFixture, { defaultChecked: true, style: SIZED });

      await userEvent.click(getSwitch());
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);

      await reset();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => hiddenInput().checked).toBe(true);
    });

    it("puts the form data back on defaultChecked as soon as the form is reset", async () => {
      await render(FormFixture, { defaultChecked: true, name: "test-switch", style: SIZED });
      await userEvent.click(getSwitch());
      expect(new FormData(getForm()).get("test-switch")).toBe(null);

      getForm().reset();

      expect(new FormData(getForm()).get("test-switch")).toBe("on");
    });

    it("resets when the form's own onreset stops propagation", async () => {
      await render(FormFixture, {
        checked: true,
        defaultChecked: false,
        name: "test-switch",
        onFormReset: (event: Event) => event.stopPropagation(),
      });

      getForm().reset();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      await expect.poll(() => hiddenInput().checked).toBe(false);
      expect(new FormData(getForm()).get("test-switch")).toBe(null);
    });

    it("submits the uncheckedValue after a reset from on to off", async () => {
      const submitSpy = vi.fn((event: SubmitEvent) =>
        new FormData(event.currentTarget as HTMLFormElement).getAll("test-switch"),
      );
      await render(FormFixture, {
        defaultChecked: false,
        name: "test-switch",
        value: "yes",
        uncheckedValue: "no",
        onFormSubmit: submitSpy,
        style: SIZED,
      });
      await userEvent.click(getSwitch());
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");

      getForm().reset();
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      await new Promise((resolve) => setTimeout(resolve, 0));

      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual(["no"]);
    });

    it("writes the reset value through bind:checked", async () => {
      const { getByTestId } = await render(FormFixture, {
        binding: "state",
        initial: true,
        defaultChecked: false,
      });
      await expect.element(getByTestId("bound")).toHaveTextContent("true");

      getForm().reset();

      await expect.element(getByTestId("bound")).toHaveTextContent("false");
      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it("does not call onCheckedChange on reset", async () => {
      const onCheckedChange = vi.fn();
      await render(FormFixture, { checked: true, defaultChecked: false, onCheckedChange });

      getForm().reset();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(onCheckedChange).toHaveBeenCalledTimes(0);
    });

    it.each([{ disabled: true }, { readOnly: true }])("resets even when %o", async (props) => {
      await render(FormFixture, { checked: true, defaultChecked: false, ...props });

      getForm().reset();

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput().checked).toBe(false);
    });

    it("does not reset when the reset event is canceled", async () => {
      await render(FormFixture, { checked: true, defaultChecked: false });
      getForm().addEventListener("reset", (event) => event.preventDefault());

      getForm().reset();
      await new Promise((resolve) => setTimeout(resolve, 0));

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
    });

    it("keeps the hidden input in sync when a function-binding setter declines the reset", async () => {
      const set = vi.fn();
      const submitSpy = vi.fn((event: SubmitEvent) =>
        new FormData(event.currentTarget as HTMLFormElement).getAll("test-switch"),
      );
      await render(FormFixture, {
        binding: "function",
        get: () => true,
        set,
        defaultChecked: false,
        name: "test-switch",
        uncheckedValue: "off",
        onFormSubmit: submitSpy,
      });

      await userEvent.click(page.getByRole("button", { name: "Reset" }));
      await expect.poll(() => set).toHaveBeenCalledWith(false);
      // Past the browser's own reset of the controls.
      await new Promise((resolve) => setTimeout(resolve, 0));

      await expect.element(getSwitch()).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
      await userEvent.click(submitButton());
      expect(submitSpy.mock.results.at(-1)?.value).toEqual(["on"]);
    });
  });
});

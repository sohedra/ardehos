import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { createPartContext } from "#lib/internals/createPartContext.js";
import ContextConsumer from "../fixtures/ContextConsumer.svelte";

const MESSAGE = "TestContext is missing. Test parts must be placed within <Test.Root>.";

describe("createPartContext", () => {
  it("throws the given message from get() outside a provider", async () => {
    const context = createPartContext<string>("TestContext", MESSAGE);
    // Svelte's dev build appends the component stack to the message.
    await expect(render(ContextConsumer, { props: { context } })).rejects.toThrow(MESSAGE);
  });

  it("returns undefined from getOptional() outside a provider", async () => {
    const context = createPartContext<string>("TestContext", MESSAGE);
    const { getByTestId } = await render(ContextConsumer, {
      props: { context, optional: true },
    });
    await expect.element(getByTestId("value")).toHaveTextContent("undefined");
  });

  it("returns the provided value inside a provider", async () => {
    const context = createPartContext<string>("TestContext", MESSAGE);
    const hasBefore: boolean[] = [];
    function Provider(...args: Parameters<typeof ContextConsumer>) {
      hasBefore.push(context.has());
      expect(context.set("provided")).toBe("provided");
      expect(context.has()).toBe(true);
      return ContextConsumer(...args);
    }
    const { getByTestId } = await render(Provider, { props: { context } });
    await expect.element(getByTestId("value")).toHaveTextContent("provided");
    expect(hasBefore).toEqual([false]);
  });
});

// `svelte/server` can't render in the browser project: the components there are compiled for the
// client, and its `render` needs server-compiled ones (it imports, then throws on the first node).
// So the render half runs in the Node project: `describeServerRender` (ssrRender.ts) renders the
// part and keeps the HTML in `__ssr__/<name>.html` with `toMatchFileSnapshot`, and the browser
// test passes that HTML string here to hydrate.
import { flushSync, hydrate, unmount, type Component } from "svelte";
import { vi } from "vitest";

/** The tag, id and `data-*` attributes of one element. */
export type ElementSnapshot = { tag: string; id: string; data: Record<string, string> };

/**
 * Puts server-rendered `html` into a container and hydrates `Component` with `props` over it.
 * Throws if hydration logs a `console.warn` or `console.error` mentioning "hydration".
 * Returns every element's tag, id and data attributes before and after hydration.
 */
export function ssrHydration<Props extends Record<string, unknown>>(
  Component: Component<Props>,
  props: Props,
  html: string,
): { before: ElementSnapshot[]; after: ElementSnapshot[] } {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  let app: ReturnType<typeof hydrate> | undefined;
  try {
    const before = snapshotElements(container);
    app = hydrate(Component, { target: container, props });
    flushSync();
    const after = snapshotElements(container);
    const messages = [...warn.mock.calls, ...error.mock.calls]
      .map((args) => args.map(String).join(" "))
      .filter((message) => message.includes("hydration"));
    if (messages.length > 0) {
      throw new Error(`Hydration logged:\n${messages.join("\n")}`);
    }
    return { before, after };
  } finally {
    warn.mockRestore();
    error.mockRestore();
    if (app) {
      unmount(app);
    }
    container.remove();
  }
}

function snapshotElements(container: Element): ElementSnapshot[] {
  return Array.from(container.querySelectorAll("*"), (element) => ({
    tag: element.tagName.toLowerCase(),
    id: element.id,
    data: Object.fromEntries(
      Array.from(element.attributes)
        .filter((attribute) => attribute.name.startsWith("data-"))
        .map((attribute) => [attribute.name, attribute.value]),
    ),
  }));
}

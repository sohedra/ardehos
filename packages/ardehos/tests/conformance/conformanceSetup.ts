import type { Component, Snippet } from "svelte";
import type { Attachment } from "svelte/attachments";

/** The props the harness gives a `wrapper`: the content, and the props the part is rendered with. */
export type ConformanceWrapperProps = {
  children: Snippet;
  /** For a wrapper that provides the state the part shows, such as `checked` for a Switch.Thumb. */
  partProps: Record<string, unknown>;
};

/**
 * Describes a part to the conformance suite. Shared by the browser suite (`describeConformance`)
 * and its server-render half (`describeServerRender`), so keep it in a module both can import.
 */
export type ConformanceSetup<State> = {
  /** The part under test. */
  part: Component<Record<string, unknown>>;
  /**
   * Providers the part must be placed within, rendered around it. It receives the part's props,
   * so it can give the part the state the setup's `on` and `off` stand for.
   */
  wrapper?: Component<ConformanceWrapperProps>;
  /** Props passed to the part on every render. */
  props?: Record<string, unknown>;
  /**
   * Props passed to the part only while it renders through the `<button>` render snippet, e.g.
   * `nativeButton: true` for a part that otherwise expects a non-button element.
   */
  renderProps?: Record<string, unknown>;
  /** The tag of the element the part renders without a render snippet. */
  defaultTag: string;
  /** A state the part shows as a data attribute, with props that turn it on and off. */
  state: {
    attribute: string;
    on: Record<string, unknown>;
    off: Record<string, unknown>;
    /** Reads the same state from the part's state object. */
    isOn: (state: State) => boolean;
  };
  /**
   * For a part with its own click handler: reads something from the element that the handler
   * changes, so the suite can tell whether it ran. Clicking the part in its `off` state must turn
   * the state on (the suite uses this to give the part state that only the part holds).
   */
  readOwnClick?: (element: Element) => unknown;
};

/** How the harness renders the part in one test. */
export type HarnessOptions = {
  /** Props passed to the part, on top of `setup.props`. */
  partProps?: Record<string, unknown>;
  /** The render snippet: a `<button {...props}>`, or an `<em>` that ignores `props`. */
  render?: "button" | "ignore-props";
  /** Passes a children snippet that prints whether the state is on. */
  withChildren?: boolean;
  /** An attachment placed on the part with `{@attach}`. */
  attach?: Attachment;
};

/** The props for `ConformanceHarness.svelte`. The part always gets `data-testid="part"` first. */
export function harnessProps<State>(setup: ConformanceSetup<State>, options: HarnessOptions = {}) {
  return {
    part: setup.part,
    wrapper: setup.wrapper,
    // The harness only passes the part's own state back to it.
    isOn: setup.state.isOn as (state: unknown) => boolean,
    render: options.render,
    renderProps: setup.renderProps,
    withChildren: options.withChildren,
    attach: options.attach,
    partProps: { "data-testid": "part", ...setup.props, ...options.partProps },
  };
}

/** The harness props the server-render fixture is made with, and later hydrated with. */
export function serverRenderProps<State>(setup: ConformanceSetup<State>) {
  return harnessProps(setup, { partProps: setup.state.on, withChildren: true });
}

<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { RenderProps } from "#lib/internals/types.js";
  import type { ConformanceWrapperProps } from "../conformance/conformanceSetup.js";

  type HarnessProps = {
    part: Component<Record<string, unknown>>;
    wrapper?: Component<ConformanceWrapperProps>;
    partProps?: Record<string, unknown>;
    /** Props added while `render` is `"button"`. */
    renderProps?: Record<string, unknown>;
    render?: "button" | "ignore-props";
    withChildren?: boolean;
    /** Reads the state the part passes to its children snippet. */
    isOn: (state: unknown) => boolean;
    attach?: Attachment;
  };

  let {
    part: Part,
    wrapper: Wrapper,
    partProps = {},
    renderProps,
    render,
    withChildren = false,
    isOn,
    attach,
  }: HarnessProps = $props();

  let ref: Element | null = $state(null);
  // Toggled through `setRender`, so changing it doesn't touch the part's props (a rerender would
  // re-derive prop-backed state and hide whether the toggle itself kept it).
  let renderMode = $derived(render);

  export function getRef() {
    return ref;
  }

  export function setRender(mode: HarnessProps["render"]) {
    renderMode = mode;
  }
</script>

<!-- Annotated because a top-level snippet has no contextual type; the unannotated user pattern is
  in TestPartRenderButton.svelte. -->
{#snippet button({ props, state }: { props: RenderProps; state: unknown })}
  <button {...props} data-on={String(isOn(state))}></button>
{/snippet}

{#snippet ignoringProps()}
  <em>x</em>
{/snippet}

{#snippet stateChildren({ state }: { state: unknown })}
  <span data-testid="children">{isOn(state) ? "on" : "off"}</span>
{/snippet}

{#snippet partElement()}
  <!-- renderProps come first, so reading another prop never depends on the render mode. -->
  <Part
    {...renderMode === "button" ? renderProps : undefined}
    {...partProps}
    bind:ref
    {@attach attach}
    render={renderMode === "button"
      ? button
      : renderMode === "ignore-props"
        ? ignoringProps
        : undefined}
    children={withChildren ? stateChildren : undefined}
  />
{/snippet}

{#if Wrapper}
  <Wrapper {partProps}>{@render partElement()}</Wrapper>
{:else}
  {@render partElement()}
{/if}

<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";

  type HarnessProps = {
    part: Component<Record<string, unknown>>;
    wrapper?: Component<{ children: Snippet }>;
    partProps?: Record<string, unknown>;
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
    render,
    withChildren = false,
    isOn,
    attach,
  }: HarnessProps = $props();

  let ref: Element | null = $state(null);

  export function getRef() {
    return ref;
  }
</script>

<!-- Typed without symbol keys: `Props` (`Record<PropertyKey, unknown>`) doesn't type-check when
  spread on an element, since its symbol index signature isn't `Attachment`. -->
{#snippet button({ props }: { props: Record<string, unknown> })}
  <button {...props}></button>
{/snippet}

{#snippet ignoringProps()}
  <em>x</em>
{/snippet}

{#snippet stateChildren({ state }: { state: unknown })}
  <span data-testid="children">{isOn(state) ? "on" : "off"}</span>
{/snippet}

{#snippet partElement()}
  <Part
    {...partProps}
    bind:ref
    {@attach attach}
    render={render === "button" ? button : render === "ignore-props" ? ignoringProps : undefined}
    children={withChildren ? stateChildren : undefined}
  />
{/snippet}

{#if Wrapper}
  <Wrapper>{@render partElement()}</Wrapper>
{:else}
  {@render partElement()}
{/if}

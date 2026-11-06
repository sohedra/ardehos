<!-- Adapted from Base UI v1.9.0 (packages/react/src/internals/useRenderElement.tsx). See NOTICE.txt. -->
<script lang="ts" generics="State">
  import type { Snippet } from "svelte";
  import { DEV } from "esm-env";
  import type { Props } from "#lib/merge-props/mergeProps.js";

  type RenderElementProps = {
    /** The element rendered when there is no `render` snippet. */
    tag: string;
    /** The merged props for the element, from `useRenderElement`. */
    props: Props;
    state: State;
    /** Replaces the element; receives the props to spread and the state. */
    render?: Snippet<[{ props: Props; state: State }]>;
    /** The element's content. Ignored when `render` is given. */
    children?: Snippet<[{ state: State }]>;
  };

  let { tag, props, state, render, children }: RenderElementProps = $props();

  // Base UI's native defaults, overridable through `props`.
  const defaults = $derived(
    tag === "button" ? { type: "button" } : tag === "img" ? { alt: "" } : undefined,
  );

  if (DEV) {
    let warned = false;
    $effect(() => {
      if (render && children && !warned) {
        warned = true;
        console.warn(
          "The children of a part are ignored when the render snippet is used. Put the content inside the render snippet instead.",
        );
      }
    });
  }
</script>

{#if render}
  {@render render({ props, state })}
{:else if children}
  <svelte:element this={tag} {...defaults} {...props}>{@render children({ state })}</svelte:element>
{:else}
  <!-- No content block, so void elements such as img don't warn. -->
  <svelte:element this={tag} {...defaults} {...props} />
{/if}

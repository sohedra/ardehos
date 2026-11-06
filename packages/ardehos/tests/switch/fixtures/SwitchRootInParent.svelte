<!-- A switch inside a parent with a click handler, optionally rendered as a native `<button>`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let {
    onParentClick,
    renderButton = false,
    ...rest
  }: {
    onParentClick?: (event: MouseEvent) => void;
    /** Renders the switch as a native `<button>` (pass `nativeButton` too). */
    renderButton?: boolean;
  } & SwitchRootProps = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div onclick={onParentClick}>
  {#if renderButton}
    <SwitchRoot {...rest}>
      {#snippet render({ props })}
        <button {...props}></button>
      {/snippet}
    </SwitchRoot>
  {:else}
    <SwitchRoot {...rest} />
  {/if}
</div>

<!-- Native labels placed before the switch and linked with `for`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let {
    labels,
    renderButton = false,
    ...rest
  }: {
    labels: { for: string; text: string }[];
    /** Renders the switch as a native `<button>` (pass `nativeButton` too). */
    renderButton?: boolean;
  } & SwitchRootProps = $props();
</script>

{#each labels as label (label.for)}
  <label for={label.for}>{label.text}</label>
{/each}
{#if renderButton}
  <SwitchRoot {...rest}>
    {#snippet render({ props })}
      <button {...props}></button>
    {/snippet}
  </SwitchRoot>
{:else}
  <SwitchRoot {...rest} />
{/if}

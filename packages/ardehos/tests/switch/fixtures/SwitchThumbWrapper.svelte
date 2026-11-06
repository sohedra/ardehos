<!-- Places a Switch.Thumb within a Switch.Root that is checked when the thumb's props say so. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";

  let { children, partProps }: { children: Snippet; partProps: Record<string, unknown> } = $props();
</script>

<SwitchRoot checked={partProps.checked === true}>
  {@render children()}
</SwitchRoot>

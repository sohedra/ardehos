<!-- `bind:checked` to the parent's `$state`, shown in `data-testid="bound"`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let { initial, ...rest }: { initial?: boolean } & SwitchRootProps = $props();

  // svelte-ignore state_referenced_locally
  let checked = $state(initial);
</script>

<SwitchRoot bind:checked {...rest} />
<output data-testid="bound">{String(checked)}</output>

<!-- A function binding: `bind:checked={get, set}`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let {
    get,
    set,
    ...rest
  }: { get: () => boolean; set: (value: boolean) => void } & SwitchRootProps = $props();
</script>

<SwitchRoot bind:checked={get, set} {...rest} />

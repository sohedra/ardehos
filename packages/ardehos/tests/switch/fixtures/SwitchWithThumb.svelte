<!-- A Switch.Root with a Switch.Thumb inside. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import SwitchThumb from "#lib/switch/thumb/SwitchThumb.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let { ...rest }: SwitchRootProps = $props();
</script>

<SwitchRoot {...rest}>
  <SwitchThumb data-testid="thumb" style="display: inline-block; width: 16px; height: 16px" />
</SwitchRoot>

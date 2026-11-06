<!-- A switch whose child reads SwitchRootContext. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";
  import SwitchRootContextValue from "./SwitchRootContextValue.svelte";

  let props: SwitchRootProps = $props();
</script>

<SwitchRoot {...props}>
  <SwitchRootContextValue />
</SwitchRoot>

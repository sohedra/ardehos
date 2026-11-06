<!-- A switch inside a wrapping native label. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let { text = "Toggle", ...rest }: { text?: string } & SwitchRootProps = $props();
</script>

<label data-testid="label">
  <SwitchRoot {...rest} />
  {text}
</label>

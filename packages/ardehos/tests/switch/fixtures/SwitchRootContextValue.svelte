<!-- Reads SwitchRootContext and shows whether the switch is checked. -->
<script lang="ts">
  import { SwitchRootContext } from "#lib/switch/root/SwitchRootContext.js";

  const state = SwitchRootContext.get();
</script>

<span data-testid="context">{state.checked ? "checked" : "unchecked"}</span>

<!-- A parent that changes a plain (unbound) `checked` from outside. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";

  let checked = $state(false);
</script>

<button type="button" onclick={() => (checked = !checked)}>Toggle</button>
<SwitchRoot {checked} />

<!-- A parent passing a plain (unbound) `checked` it can set through `setChecked`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";

  let checked = $state(false);

  export function setChecked(value: boolean) {
    checked = value;
  }
</script>

<SwitchRoot {checked} style="display: inline-block; width: 16px; height: 16px" />

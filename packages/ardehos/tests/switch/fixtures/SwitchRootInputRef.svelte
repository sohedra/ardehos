<!-- `bind:inputRef`, read back through `getInputRef()`. -->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";

  let inputRef: HTMLInputElement | null = $state(null);

  export function getInputRef() {
    return inputRef;
  }
</script>

<SwitchRoot bind:inputRef />

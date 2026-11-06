<!-- TestPart with a render snippet written the way users write it: unannotated, typed by the part. -->
<script lang="ts">
  import TestPart from "./TestPart.svelte";

  let { active = false }: { active?: boolean } = $props();
</script>

<TestPart {active} data-testid="part">
  {#snippet render({ props })}
    <button {...props}>Press</button>
  {/snippet}
</TestPart>

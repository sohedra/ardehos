<!-- Several switches on one page: three with a sibling label, one with a generated id. -->
<script lang="ts">
  import { Switch } from "#lib/index.js";

  const names = ["first", "second", "third"];
</script>

{#each names as name (name)}
  <div>
    <label for={name}>{name}</label>
    <Switch.Root id={name} {name}>
      <Switch.Thumb />
    </Switch.Root>
  </div>
{/each}
<Switch.Root><Switch.Thumb /></Switch.Root>

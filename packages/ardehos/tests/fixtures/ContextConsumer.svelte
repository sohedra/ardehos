<script lang="ts">
  import type { PartContext } from "#lib/internals/createPartContext.js";

  type ConsumerProps = {
    context: PartContext<string>;
    optional?: boolean;
  };

  const { context, optional = false }: ConsumerProps = $props();

  // Context is read once, during initialisation, as parts do.
  // svelte-ignore state_referenced_locally
  const value = optional ? context.getOptional() : context.get();
</script>

<span data-testid="value">{String(value)}</span>

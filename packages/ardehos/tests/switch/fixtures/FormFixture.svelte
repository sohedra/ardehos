<!--
  A switch in a plain `<form>` with Submit and Reset buttons. Submitting is always prevented, then
  reported through `onFormSubmit`.
  - `form`: the switch is rendered outside the form, which gets this id.
  - `binding`: `"state"` binds `checked` to a `$state` starting at `initial`, shown in
    `data-testid="bound"`; `"function"` binds it to `get` / `set`.
  - `onFormReset`: the form's own `onreset` handler.
  - `nativeCheckbox`: also renders a native checkbox with this name in the form.
-->
<script lang="ts">
  import SwitchRoot from "#lib/switch/root/SwitchRoot.svelte";
  import type { SwitchRootProps } from "#lib/switch/root/types.js";

  let {
    form,
    binding,
    initial,
    get = () => false,
    set = () => {},
    nativeCheckbox,
    onFormSubmit,
    onFormReset,
    ...rest
  }: {
    binding?: "state" | "function";
    initial?: boolean;
    get?: () => boolean;
    set?: (value: boolean) => void;
    nativeCheckbox?: string;
    onFormSubmit?: (event: SubmitEvent) => void;
    onFormReset?: (event: Event) => void;
  } & SwitchRootProps = $props();

  // svelte-ignore state_referenced_locally
  let checked = $state(initial);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    onFormSubmit?.(event);
  }
</script>

{#snippet control()}
  {#if binding === "state"}
    <SwitchRoot bind:checked {form} {...rest} />
  {:else if binding === "function"}
    <SwitchRoot bind:checked={get, set} {form} {...rest} />
  {:else}
    <SwitchRoot {form} {...rest} />
  {/if}
{/snippet}

<form id={form} onsubmit={handleSubmit} onreset={onFormReset}>
  {#if !form}
    {@render control()}
  {/if}
  {#if nativeCheckbox}
    <input type="checkbox" name={nativeCheckbox} />
  {/if}
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
{#if form}
  {@render control()}
{/if}
<!-- Outside the form: an `<output>` inside it would be reset too. -->
<span data-testid="bound">{String(checked)}</span>

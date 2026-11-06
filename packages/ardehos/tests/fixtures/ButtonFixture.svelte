<script lang="ts">
  import { useButton } from "#lib/internals/use-button/useButton.svelte.js";

  type Props = {
    tag?: "span" | "button";
    native?: boolean;
    disabled?: boolean;
    focusableWhenDisabled?: boolean;
    tabIndex?: number;
    [key: string]: unknown;
  };

  let {
    tag = "span",
    native = false,
    disabled = false,
    focusableWhenDisabled,
    tabIndex,
    ...rest
  }: Props = $props();

  const button = useButton(() => ({ native, disabled, focusableWhenDisabled, tabIndex }));
</script>

<svelte:element this={tag} data-testid="button" {...button.getButtonProps(rest)} {...button.ref}>
  Button
</svelte:element>

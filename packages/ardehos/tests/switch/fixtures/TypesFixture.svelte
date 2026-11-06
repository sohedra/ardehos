<!-- Checked by `pnpm check`: the public types resolve and have the expected shapes. -->
<script lang="ts">
  import { Switch, type SwitchRootProps } from "#lib/index.js";

  const rootProps: Switch.Root.Props = { defaultChecked: true };
  const flatProps: SwitchRootProps = rootProps;
  const thumbProps: Switch.Thumb.Props = {
    class: (state: Switch.Thumb.State) => state.checked && "on",
  };
  const state: Switch.Root.State | undefined = undefined;
  const reason: Switch.Root.ChangeEventReason = "none";

  function onCheckedChange(checked: boolean, details: Switch.Root.ChangeEventDetails) {
    if (details.reason === reason && checked) {
      details.cancel();
    }
  }

  // @ts-expect-error `checked` is a boolean
  const wrong: Switch.Root.Props = { checked: "yes" };
  void [flatProps, state, wrong];
</script>

<Switch.Root {...rootProps} {onCheckedChange}>
  <Switch.Thumb {...thumbProps} />
</Switch.Root>

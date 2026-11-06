<!-- Adapted from Base UI v1.9.0 (packages/react/src/switch/thumb/SwitchThumb.tsx). See NOTICE.txt. -->
<script lang="ts">
  import RenderElement from "#lib/internals/RenderElement.svelte";
  import { attachRef } from "#lib/internals/attachRef.svelte.js";
  import { useRenderElement } from "#lib/internals/useRenderElement.svelte.js";
  import { SwitchRootContext } from "../root/SwitchRootContext.js";
  import { stateAttributesMapping } from "../stateAttributesMapping.js";
  import type { SwitchThumbProps } from "./types.js";

  /**
   * The movable part of the switch that indicates whether the switch is on or off.
   * Renders a `<span>` element.
   */
  let {
    class: className,
    style,
    render,
    children,
    ref = $bindable(null),
    ...elementProps
  }: SwitchThumbProps = $props();

  // The root's state, read through getters, so it stays up to date.
  const state = SwitchRootContext.get();

  const refAttachment = attachRef<HTMLElement>((element) => {
    ref = element;
  });

  const element = useRenderElement(() => ({
    state,
    class: className,
    style,
    mapping: stateAttributesMapping,
    props: [elementProps, refAttachment],
  }));
</script>

<RenderElement tag="span" props={element.props} {state} {render} {children} />

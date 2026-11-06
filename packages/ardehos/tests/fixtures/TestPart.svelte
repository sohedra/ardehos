<!-- A minimal part built only from the foundation. Clicking it toggles `active`. -->
<script lang="ts" module>
  export type TestPartState = { active: boolean };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import RenderElement from "#lib/internals/RenderElement.svelte";
  import { attachRef } from "#lib/internals/attachRef.svelte.js";
  import { useRenderElement } from "#lib/internals/useRenderElement.svelte.js";
  import type { RenderProps } from "#lib/internals/types.js";

  type TestPartProps = {
    active?: boolean;
    class?: ClassValue | ((state: TestPartState) => ClassValue);
    style?: string | ((state: TestPartState) => string | undefined);
    render?: Snippet<[{ props: RenderProps; state: TestPartState }]>;
    children?: Snippet<[{ state: TestPartState }]>;
    ref?: HTMLElement | null;
    [key: string]: unknown;
  };

  let {
    active: activeProp = false,
    class: className,
    style,
    render,
    children,
    ref = $bindable(null),
    ...elementProps
  }: TestPartProps = $props();

  const id = $props.id();
  let active = $derived(activeProp);
  const state: TestPartState = $derived({ active });

  const refAttachment = attachRef<HTMLElement>((element) => {
    ref = element;
  });

  const element = useRenderElement(() => ({
    state,
    class: className,
    style,
    mapping: { active: (value) => (value ? { "data-active": "" } : null) },
    props: [
      {
        id,
        onclick: () => {
          active = !active;
        },
      },
      refAttachment,
      elementProps,
    ],
  }));
</script>

<RenderElement tag="span" props={element.props} {state} {render} {children} />

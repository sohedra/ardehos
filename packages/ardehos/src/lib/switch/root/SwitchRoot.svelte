<!-- Adapted from Base UI v1.9.0 (packages/react/src/switch/root/SwitchRoot.tsx). See NOTICE.txt. -->
<script lang="ts">
  import { on } from "svelte/events";
  import RenderElement from "#lib/internals/RenderElement.svelte";
  import { attachRef } from "#lib/internals/attachRef.svelte.js";
  import { createChangeEventDetails } from "#lib/internals/createEventDetails.js";
  import { useAriaLabelledBy } from "#lib/internals/labelable-provider/useAriaLabelledBy.svelte.js";
  import { REASONS } from "#lib/internals/reasons.js";
  import { useButton } from "#lib/internals/use-button/useButton.svelte.js";
  import { useRenderElement } from "#lib/internals/useRenderElement.svelte.js";
  import type { Props } from "#lib/merge-props/mergeProps.js";
  import { dispatchClickWithModifiers } from "#lib/utils/dispatchClickWithModifiers.js";
  import { visuallyHidden, visuallyHiddenInput } from "#lib/utils/visuallyHidden.js";
  import { stateAttributesMapping } from "../stateAttributesMapping.js";
  import { SwitchRootContext } from "./SwitchRootContext.js";
  import type { SwitchRootProps, SwitchRootState } from "./types.js";

  /**
   * Represents the switch itself.
   * Renders a `<span>` element and a hidden `<input>` beside.
   */
  let {
    checked = $bindable(),
    class: className,
    defaultChecked,
    "aria-labelledby": ariaLabelledByProp,
    form,
    id: idProp,
    inputRef = $bindable(null),
    name,
    nativeButton = false,
    onCheckedChange,
    readOnly = false,
    required = false,
    disabled = false,
    render,
    children,
    ref = $bindable(null),
    uncheckedValue,
    value,
    style,
    ...elementProps
  }: SwitchRootProps = $props();

  // The switch keeps its own copy of the value. An unbound prop's local value is dropped whenever
  // the parent re-provides its props (a spread does on any change): an undefined `checked` then
  // falls back to this copy, so an uncontrolled switch keeps the user's toggle. A defined
  // `checked` that is re-provided replaces the user's toggle, as with any overridden Svelte prop.
  // svelte-ignore state_referenced_locally
  let localChecked = $state(checked ?? defaultChecked ?? false);

  // Like a native `bind:checked`, a bound `null` or `undefined` takes `defaultChecked`, and the
  // binding is written.
  // svelte-ignore state_referenced_locally
  if (checked == null) {
    checked = localChecked;
  }

  const isChecked = $derived(checked ?? localChecked);

  const generatedId = $props.id();
  const controlId = $derived(idProp ?? generatedId);
  const hiddenInputId = $derived(nativeButton ? undefined : controlId);

  let rootElement: HTMLElement | null = null;
  let inputElement: HTMLInputElement | null = $state(null);

  const rootRef = attachRef<HTMLElement>((element) => {
    rootElement = element;
    ref = element;
  });
  const inputRefAttachment = attachRef<HTMLInputElement>((element) => {
    inputElement = element;
    inputRef = element;
  });

  const button = useButton(() => ({ disabled, native: nativeButton }));

  const ariaLabelledBy = useAriaLabelledBy(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: undefined,
    labelSource: inputElement,
    enableFallback: !nativeButton,
    labelSourceId: hiddenInputId,
    ariaLabel: elementProps["aria-label"] ?? undefined,
  }));

  // Getters, so the parts reading this object through the context stay up to date.
  const rootState: SwitchRootState = {
    get checked() {
      return isChecked;
    },
    get disabled() {
      return disabled;
    },
    get readOnly() {
      return readOnly;
    },
    get required() {
      return required;
    },
    // Base UI's defaults without a Field.
    touched: false,
    dirty: false,
    valid: null,
    filled: false,
    focused: false,
  };

  SwitchRootContext.set(rootState);

  const rootProps = $derived<Props>({
    id: nativeButton ? controlId : undefined,
    role: "switch",
    "aria-checked": isChecked,
    "aria-readonly": readOnly || undefined,
    "aria-required": required || undefined,
    "aria-labelledby": ariaLabelledBy.value,
    onclick(event: MouseEvent) {
      if (readOnly || disabled) {
        return;
      }

      event.preventDefault();

      if (!inputElement) {
        return;
      }

      dispatchClickWithModifiers(inputElement, event);
    },
  });

  const element = useRenderElement(() => ({
    state: rootState,
    class: className,
    style,
    mapping: stateAttributesMapping,
    props: [
      rootProps,
      elementProps,
      (merged) => button.getButtonProps(merged),
      rootRef,
      button.ref,
    ],
  }));

  // The toggle is handled on the click, before the input's `input` and `change` events, as React
  // does for Base UI's `onChange`. Preventing the click's default undoes the native toggle, and
  // then the input fires neither event, so a canceled or declined change leaves no trace.
  function handleInputClick(event: MouseEvent) {
    // The click dispatched from the root's `onclick` is an implementation detail
    // and must not reach ancestors, which already receive the original click.
    event.stopPropagation();

    if (event.defaultPrevented) {
      return;
    }

    if (readOnly) {
      event.preventDefault();
      return;
    }

    const nextChecked = (event.currentTarget as HTMLInputElement).checked;
    const eventDetails = createChangeEventDetails(REASONS.none, event);

    onCheckedChange?.(nextChecked, eventDetails);

    if (eventDetails.isCanceled) {
      event.preventDefault();
      return;
    }

    checked = nextChecked;

    // A function binding's setter can decline the value: keep the input on the shown one.
    if (isChecked !== nextChecked) {
      event.preventDefault();
      return;
    }

    localChecked = nextChecked;
  }

  // A form reset restores `defaultChecked`, as for a native checkbox: the bound value is written,
  // and `onCheckedChange` isn't called (a native reset fires no `input` or `change` event), even
  // when the switch is disabled or read-only.
  function handleFormReset(event: Event) {
    const formElement = event.currentTarget;

    // `reset` fires before the browser resets the controls, and after a reset button's click even
    // a microtask runs before that, so the switch is reset a task later.
    setTimeout(() => {
      // Skip a canceled reset, and a switch that has since unmounted or left the form.
      if (event.defaultPrevented || !inputElement || inputElement.form !== formElement) {
        return;
      }

      const resetChecked = defaultChecked ?? false;
      checked = resetChecked;

      // A function binding's setter can decline the value.
      if (isChecked === resetChecked) {
        localChecked = resetChecked;
      }

      // The browser reset the input to its `checked` attribute: put it back on the shown value.
      inputElement.checked = isChecked;
    });
  }

  $effect(() => {
    // Read so the listener moves when the input's `form` attribute points to another form.
    void form;
    const formElement = inputElement?.form;
    if (formElement) {
      return on(formElement, "reset", handleFormReset);
    }
  });
</script>

<!-- No whitespace between the elements: it would render a text node beside the switch. -->
<RenderElement
  tag="span"
  props={element.props}
  state={rootState}
  {render}
  {children}
/>{#if !isChecked && name && uncheckedValue !== undefined}<input
    type="hidden"
    {form}
    {name}
    value={uncheckedValue}
    {disabled}
  />{/if}<input
  type="checkbox"
  checked={isChecked}
  {disabled}
  {form}
  id={hiddenInputId}
  {name}
  {required}
  {value}
  style={name ? visuallyHiddenInput : visuallyHidden}
  tabindex={-1}
  aria-hidden="true"
  onclick={handleInputClick}
  onfocus={() => rootElement?.focus()}
  {...inputRefAttachment}
/>

// Adapted from Base UI v1.9.0 (packages/react/src/switch/root/SwitchRoot.tsx). See NOTICE.txt.
import type { Snippet } from "svelte";
import type { ClassValue, HTMLAttributes } from "svelte/elements";
import type { ChangeEventDetails } from "#lib/internals/createEventDetails.js";
import type { REASONS } from "#lib/internals/reasons.js";
import type { RenderProps } from "#lib/internals/types.js";

export type SwitchRootState = {
  /**
   * Whether the switch is currently active.
   */
  checked: boolean;
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the user should be unable to activate or deactivate the switch.
   */
  readOnly: boolean;
  /**
   * Whether the user must activate the switch before submitting a form.
   */
  required: boolean;
  /**
   * Whether the field has been touched. Always `false` until Field is ported.
   */
  touched: boolean;
  /**
   * Whether the field's value has changed from its initial value. Always `false` until Field is
   * ported.
   */
  dirty: boolean;
  /**
   * Whether the field is valid; `null` until it has been validated. Always `null` until Field is
   * ported.
   */
  valid: boolean | null;
  /**
   * Whether the field has a value. Always `false` until Field is ported.
   */
  filled: boolean;
  /**
   * Whether the field's control is focused. Always `false` until Field is ported.
   */
  focused: boolean;
};

export type SwitchRootChangeEventReason = typeof REASONS.none;
export type SwitchRootChangeEventDetails = ChangeEventDetails<SwitchRootChangeEventReason>;

type OwnProps = {
  /**
   * The id of the hidden input element.
   *
   * When `nativeButton` is `true`, the id is applied to the root element.
   */
  id?: string | undefined;
  /**
   * Whether the switch is currently active. Bindable.
   *
   * Without a binding it is the starting value, and follows later changes from the parent.
   */
  checked?: boolean | undefined;
  /**
   * Whether the switch is initially active, when `checked` isn't given.
   * @default false
   */
  defaultChecked?: boolean | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * The hidden `<input>` element. Bindable.
   */
  inputRef?: HTMLInputElement | null | undefined;
  /**
   * The rendered element. Bindable.
   */
  ref?: HTMLElement | null | undefined;
  /**
   * Identifies the field when a form is submitted.
   */
  name?: string | undefined;
  /**
   * Identifies the form that owns the hidden input.
   * Useful when the switch is rendered outside the form.
   */
  form?: string | undefined;
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` snippet.
   * Set to `true` if the rendered element is a native button.
   * @default false
   */
  nativeButton?: boolean | undefined;
  /**
   * Event handler called when the switch is activated or deactivated. Call
   * `eventDetails.cancel()` to keep the current value.
   */
  onCheckedChange?:
    | ((checked: boolean, eventDetails: SwitchRootChangeEventDetails) => void)
    | undefined;
  /**
   * Whether the user should be unable to activate or deactivate the switch.
   * @default false
   */
  readOnly?: boolean | undefined;
  /**
   * Whether the user must activate the switch before submitting a form.
   * @default false
   */
  required?: boolean | undefined;
  /**
   * The value submitted with the form when the switch is on.
   * By default, switch submits the "on" value, matching native checkbox behavior.
   */
  value?: string | undefined;
  /**
   * The value submitted with the form when the switch is off.
   * By default, unchecked switches do not submit any value, matching native checkbox behavior.
   */
  uncheckedValue?: string | undefined;
  /**
   * A class for the element: a value, or a function of the state.
   */
  class?: ClassValue | ((state: SwitchRootState) => ClassValue) | undefined;
  /**
   * A style for the element: a string, or a function of the state.
   */
  style?: string | ((state: SwitchRootState) => string | undefined) | undefined;
  /**
   * Replaces the element. Spread `props` onto the element you render.
   */
  render?: Snippet<[{ props: RenderProps; state: SwitchRootState }]> | undefined;
  /**
   * The element's content. Ignored when `render` is given.
   */
  children?: Snippet<[{ state: SwitchRootState }]> | undefined;
};

export type SwitchRootProps = Omit<HTMLAttributes<HTMLSpanElement>, keyof OwnProps> & OwnProps;

// Adapted from Base UI v1.9.0 (packages/react/src/utils/useFocusableWhenDisabled.ts). See NOTICE.txt.
import type { Props } from "#lib/merge-props/mergeProps.js";

export type UseFocusableWhenDisabledParameters = {
  /** Whether the component should be focusable when disabled. */
  focusableWhenDisabled?: boolean;
  /** The disabled state of the component. */
  disabled: boolean;
  /** @default 0 */
  tabIndex?: number;
  /** @default true */
  isNativeButton?: boolean;
};

/**
 * Props that keep a disabled button focusable (or not), derived from the parameters.
 * Properties are only present when set: assigning `undefined` would block props merged later.
 */
export function useFocusableWhenDisabled(params: () => UseFocusableWhenDisabledParameters): {
  readonly props: Props;
} {
  const props = $derived.by(() => {
    const { focusableWhenDisabled, disabled, tabIndex = 0, isNativeButton = true } = params();

    const additionalProps: Props = {
      // allow Tabbing away from focusableWhenDisabled elements
      onkeydown(event: KeyboardEvent) {
        if (disabled && focusableWhenDisabled && event.key !== "Tab") {
          event.preventDefault();
        }
      },
      tabindex: tabIndex,
    };

    if (!isNativeButton && disabled) {
      additionalProps.tabindex = focusableWhenDisabled ? tabIndex : -1;
    }

    if ((isNativeButton && focusableWhenDisabled) || (!isNativeButton && disabled)) {
      additionalProps["aria-disabled"] = disabled;
    }

    if (isNativeButton && !focusableWhenDisabled) {
      additionalProps.disabled = disabled;
    }

    return additionalProps;
  });

  return {
    get props() {
      return props;
    },
  };
}

// Adapted from Base UI v1.9.0 (packages/react/src/internals/use-button/useButton.ts). See NOTICE.txt.
import { DEV } from "esm-env";
import type { Attachment } from "svelte/attachments";
import { attachRef } from "#lib/internals/attachRef.svelte.js";
import type { ComponentEvent } from "#lib/internals/types.js";
import { makeEventPreventable, mergeProps, type Props } from "#lib/merge-props/mergeProps.js";
import { dispatchClickWithModifiers } from "#lib/utils/dispatchClickWithModifiers.js";
import { useFocusableWhenDisabled } from "#lib/utils/useFocusableWhenDisabled.svelte.js";

export type UseButtonParameters = {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the button may receive focus even if it is disabled.
   * @default false
   */
  focusableWhenDisabled?: boolean;
  /** @default 0 */
  tabIndex?: number;
  /**
   * Whether the component is being rendered as a native button.
   * @default true
   */
  native?: boolean;
};

export type UseButtonReturnValue = {
  /** Resolves the props to spread on the button, merged with the external props. */
  getButtonProps(external?: Props): Props;
  /**
   * Attachment props that track the button element. Spread them on the rendered element;
   * they are not part of the props `getButtonProps` returns.
   */
  readonly ref: Record<symbol, Attachment>;
};

export function useButton(params: () => UseButtonParameters = () => ({})): UseButtonReturnValue {
  const isDisabled = () => params().disabled ?? false;
  const isNative = () => params().native ?? true;

  let element = $state<Element | null>(null);

  const focusable = useFocusableWhenDisabled(() => {
    const { disabled = false, focusableWhenDisabled, tabIndex, native = true } = params();
    return { disabled, focusableWhenDisabled, tabIndex, isNativeButton: native };
  });

  if (DEV) {
    $effect(() => {
      if (!element) {
        return;
      }

      const isButtonTag = isButtonElement(element);

      if (isNative()) {
        if (!isButtonTag) {
          console.error(
            "A component that acts as a button expected a native <button> because the " +
              "`nativeButton` prop is true. Rendering a non-<button> removes native button " +
              "semantics, which can impact forms and accessibility. Use a real <button> in the " +
              "`render` prop, or set `nativeButton` to `false`.",
          );
        }
      } else if (isButtonTag) {
        console.error(
          "A component that acts as a button expected a non-<button> because the `nativeButton` " +
            "prop is false. Rendering a <button> keeps native behavior while the component applies " +
            "non-native attributes and handlers, which can add unintended extra attributes (such " +
            "as `role` or `aria-disabled`). Use a non-<button> in the `render` prop, or set " +
            "`nativeButton` to `true`.",
        );
      }
    });
  }

  function getButtonProps(externalProps: Props = {}): Props {
    const {
      onclick: externalOnClick,
      onmousedown: externalOnMouseDown,
      onkeyup: externalOnKeyUp,
      onkeydown: externalOnKeyDown,
      onpointerdown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps as Record<string, ((event: Event) => void) | undefined> & Props;

    return mergeProps(
      {
        onclick(event: MouseEvent) {
          if (isDisabled()) {
            event.preventDefault();
            return;
          }
          externalOnClick?.(event);
        },
        onmousedown(event: MouseEvent) {
          if (!isDisabled()) {
            externalOnMouseDown?.(event);
          }
        },
        onkeydown(event: ComponentEvent<KeyboardEvent>) {
          if (isDisabled()) {
            return;
          }

          makeEventPreventable(event);
          externalOnKeyDown?.(event);
          if (event.componentHandlerPrevented) {
            return;
          }

          const native = isNative();
          const isCurrentTarget = event.target === event.currentTarget;
          const currentTarget = event.currentTarget as Element;
          const isButton = isButtonElement(currentTarget);
          const isLink = !native && isValidLinkElement(currentTarget);
          const shouldClick = isCurrentTarget && (native ? isButton : !isLink);
          const isEnterKey = event.key === "Enter";
          const isSpaceKey = event.key === " ";

          // Keyboard accessibility for native and non-native elements.
          if (!shouldClick || native || (!isSpaceKey && !isEnterKey)) {
            // Space activates links on keyup (`role="button"` semantics); prevent the page
            // scroll Space would otherwise trigger. Enter is left to the browser's native
            // link activation.
            if (isCurrentTarget && isLink && isSpaceKey) {
              event.preventDefault();
            }
            return;
          }

          // Match native buttons: preventing the keydown's default cancels activation.
          if (event.defaultPrevented) {
            return;
          }

          event.preventDefault();

          if (isEnterKey) {
            event.preventComponentHandler();
            dispatchClickWithModifiers(currentTarget, event);
          }
        },
        onkeyup(event: ComponentEvent<KeyboardEvent>) {
          if (isDisabled()) {
            return;
          }

          makeEventPreventable(event);
          externalOnKeyUp?.(event);

          if (event.componentHandlerPrevented) {
            return;
          }

          // Keyboard accessibility for non interactive elements.
          // Match native buttons: preventing the keyup's default cancels Space activation.
          // Limitation: unlike a native <button>, a prevented *keydown* cannot cancel the
          // activation: no state is kept between keydown and keyup, so we can't tell
          // whether the keydown was prevented or even happened on this element.
          if (
            event.target === event.currentTarget &&
            !isNative() &&
            !event.defaultPrevented &&
            event.key === " "
          ) {
            event.preventComponentHandler();
            dispatchClickWithModifiers(event.currentTarget as Element, event);
          }
        },
        onpointerdown(event: PointerEvent) {
          if (isDisabled()) {
            event.preventDefault();
            return;
          }
          externalOnPointerDown?.(event);
        },
      },
      isNative() ? { type: "button" } : { role: "button" },
      focusable.props,
      otherExternalProps,
    );
  }

  return {
    getButtonProps,
    ref: attachRef<Element>((node) => {
      element = node;
    }),
  };
}

function isButtonElement(elem: Element | null): elem is HTMLButtonElement {
  return elem?.tagName === "BUTTON";
}

function isValidLinkElement(elem: Element | null): elem is HTMLAnchorElement {
  return elem?.tagName === "A" && Boolean((elem as HTMLAnchorElement).href);
}

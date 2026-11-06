// Adapted from Base UI v1.9.0 (packages/react/src/merge-props/mergeProps.ts). See NOTICE.txt.

import type { ClassValue } from "svelte/elements";
import type { ComponentEvent } from "#lib/internals/types.js";

export type Props = Record<PropertyKey, unknown>;
type PropsSource = Props | ((merged: Props) => Props) | undefined;
type AnyFunction = (...args: unknown[]) => unknown;

const EMPTY_PROPS: Props = {};

/**
 * Merges sets of element props. The rightmost source overwrites conflicting fields, except for
 * event handlers, `class` and `style`.
 *
 * Event handlers run right to left. A handler can stop the handlers to its left by calling
 * `event.preventComponentHandler()`. Calls with a non-event first argument always run every handler.
 *
 * `class` becomes a `ClassValue` array with the rightmost value first. `style` strings are joined
 * so the rightmost declarations win in CSS.
 *
 * A function source receives the props merged so far (left to right) and its return value replaces
 * them. It must chain event handlers itself, checking `event.componentHandlerPrevented`.
 */
export function mergeProps(...sources: PropsSource[]): Props {
  if (sources.length === 0) {
    return EMPTY_PROPS;
  }
  let merged = createInitialProps(sources[0]);
  for (let i = 1; i < sources.length; i += 1) {
    merged = mergeInto(merged, sources[i]);
  }
  return merged;
}

function createInitialProps(source: PropsSource): Props {
  if (typeof source === "function") {
    return { ...source(EMPTY_PROPS) };
  }
  const copied: Props = {};
  for (const key of Reflect.ownKeys(source ?? EMPTY_PROPS)) {
    const value = (source as Props)[key];
    copied[key] = isEventHandler(key, value) ? wrapEventHandler(value) : value;
  }
  return copied;
}

function mergeInto(merged: Props, source: PropsSource): Props {
  if (typeof source === "function") {
    return source(merged);
  }
  if (!source) {
    return merged;
  }
  for (const key of Reflect.ownKeys(source)) {
    const value = source[key];
    if (key === "style") {
      merged.style = mergeStyles(merged.style, value);
    } else if (key === "class") {
      merged.class = mergeClasses(merged.class, value);
    } else if (isEventHandler(key, value)) {
      merged[key] = mergeEventHandlers(merged[key] as AnyFunction | undefined, value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function isEventHandler(key: PropertyKey, value: unknown): value is AnyFunction | undefined {
  return (
    typeof key === "string" &&
    /^on[a-z]+$/.test(key) &&
    (typeof value === "function" || value === undefined)
  );
}

function mergeEventHandlers(
  ours: AnyFunction | undefined,
  theirs: AnyFunction | undefined,
): AnyFunction | undefined {
  if (!theirs) {
    return ours;
  }
  if (!ours) {
    return wrapEventHandler(theirs);
  }
  return (...args: unknown[]) => {
    const event = args[0];
    if (event instanceof Event) {
      const preventable = makeEventPreventable(event);
      const result = theirs(...args);
      if (!preventable.componentHandlerPrevented) {
        ours(...args);
      }
      return result;
    }
    const result = theirs(...args);
    ours(...args);
    return result;
  };
}

function wrapEventHandler(handler: AnyFunction | undefined): AnyFunction | undefined {
  if (!handler) {
    return handler;
  }
  return (...args: unknown[]) => {
    const event = args[0];
    if (event instanceof Event) {
      makeEventPreventable(event);
    }
    return handler(...args);
  };
}

export function makeEventPreventable<E extends Event>(event: E): ComponentEvent<E> {
  const preventable = event as ComponentEvent<E>;
  preventable.preventComponentHandler = () => {
    (preventable.componentHandlerPrevented as boolean) = true;
  };
  return preventable;
}

function mergeClasses(ours: unknown, theirs: unknown): ClassValue {
  if (ours == null) {
    return theirs as ClassValue;
  }
  if (theirs == null) {
    return ours as ClassValue;
  }
  return [theirs as ClassValue, ours as ClassValue];
}

function mergeStyles(ours: unknown, theirs: unknown): unknown {
  if (typeof ours !== "string" || !ours) {
    return theirs ?? ours;
  }
  if (typeof theirs !== "string" || !theirs) {
    return ours;
  }
  return `${ours.replace(/;\s*$/, "")}; ${theirs}`;
}

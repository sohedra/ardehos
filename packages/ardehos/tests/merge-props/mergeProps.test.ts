import { createAttachmentKey } from "svelte/attachments";
import { describe, expect, it, vi } from "vitest";
import { mergeProps } from "#lib/merge-props/index.js";
import type { ComponentEvent } from "#lib/internals/types.js";

describe("mergeProps", () => {
  it("lets the rightmost plain prop win", () => {
    expect(mergeProps({ id: "a" }, { id: "b" }).id).toBe("b");
  });

  it("handles undefined sources and no sources", () => {
    expect(mergeProps()).toEqual({});
    expect(mergeProps(undefined, { id: "a" }, undefined)).toEqual({ id: "a" });
  });

  it("runs handlers rightmost first", () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onclick: () => calls.push("a") },
      { onclick: () => calls.push("b") },
    );
    (merged.onclick as (e: Event) => void)(new Event("click"));
    expect(calls).toEqual(["b", "a"]);
  });

  it("stops left handlers when the rightmost calls preventComponentHandler", () => {
    const ours = vi.fn();
    const event = new Event("click", { cancelable: true });
    const merged = mergeProps(
      { onclick: ours },
      { onclick: (e: ComponentEvent<Event>) => e.preventComponentHandler() },
    );
    (merged.onclick as (e: Event) => void)(event);
    expect(ours).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not stop left handlers on preventDefault", () => {
    const ours = vi.fn();
    const merged = mergeProps({ onclick: ours }, { onclick: (e: Event) => e.preventDefault() });
    (merged.onclick as (e: Event) => void)(new Event("click", { cancelable: true }));
    expect(ours).toHaveBeenCalledOnce();
  });

  it("runs every handler for non-event arguments", () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onchange: () => calls.push("a") },
      { onchange: () => calls.push("b") },
    );
    (merged.onchange as (v: unknown) => void)("value");
    expect(calls).toEqual(["b", "a"]);
  });

  it("returns the rightmost handler's result", () => {
    const merged = mergeProps({ onclick: () => 1 }, { onclick: () => 2 });
    expect((merged.onclick as (e: Event) => unknown)(new Event("click"))).toBe(2);
  });

  it("merges class as [theirs, ours] and drops undefined sides", () => {
    expect(mergeProps({ class: "a" }, { class: "b" }).class).toEqual(["b", "a"]);
    expect(mergeProps({ class: "a" }, { class: undefined }).class).toBe("a");
    expect(mergeProps({}, { class: "b" }).class).toBe("b");
  });

  it("merges style so the rightmost declaration wins", () => {
    expect(mergeProps({ style: "color: red" }, { style: "color: blue" }).style).toBe(
      "color: red; color: blue",
    );
    expect(mergeProps({ style: "color: red;" }, { style: "top: 0" }).style).toBe(
      "color: red; top: 0",
    );
    expect(mergeProps({ style: "color: red" }, { style: undefined }).style).toBe("color: red");
  });

  it("passes merged props to function sources and uses their result", () => {
    const first = vi.fn();
    const second = vi.fn();
    const received: unknown[] = [];
    const merged = mergeProps(
      { id: "a", onclick: first },
      (props) => {
        received.push({ ...props });
        return { id: "fn" };
      },
      { onclick: second },
    );
    expect(received).toHaveLength(1);
    expect((received[0] as { id: string }).id).toBe("a");
    expect(merged.id).toBe("fn");
    (merged.onclick as (e: Event) => void)(new Event("click"));
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });

  it("only treats on[a-z]+ function props as handlers", () => {
    const merged = mergeProps({ onClick: "a", ontest: 1 }, { onClick: "b", ontest: 2 });
    expect(merged.onClick).toBe("b");
    expect(merged.ontest).toBe(2);
  });

  it("keeps the defined side when a handler slot is undefined", () => {
    const fn = vi.fn();
    const event = new Event("click");
    const rightFn = mergeProps({ onclick: undefined }, { onclick: fn });
    (rightFn.onclick as (e: Event) => void)(event);
    expect(fn).toHaveBeenCalledOnce();

    const leftFn = mergeProps({ onclick: fn }, { onclick: undefined });
    (leftFn.onclick as (e: Event) => void)(event);
    expect(fn).toHaveBeenCalledTimes(2);

    const both = mergeProps({ onclick: undefined }, { onclick: undefined });
    expect("onclick" in both).toBe(true);
    expect(both.onclick).toBeUndefined();
  });

  it("keeps attachments from every source", () => {
    const k1 = createAttachmentKey();
    const k2 = createAttachmentKey();
    const a = () => {};
    const b = () => {};
    const merged = mergeProps({ [k1]: a }, { [k2]: b });
    expect(merged[k1]).toBe(a);
    expect(merged[k2]).toBe(b);
  });
});

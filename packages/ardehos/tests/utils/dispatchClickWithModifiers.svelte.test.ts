import { describe, expect, it } from "vitest";
import { dispatchClickWithModifiers } from "#lib/utils/dispatchClickWithModifiers.js";

describe("dispatchClickWithModifiers", () => {
  function setup() {
    const button = document.createElement("button");
    document.body.appendChild(button);
    const clicks: MouseEvent[] = [];
    button.addEventListener("click", (event) => clicks.push(event as MouseEvent));
    return { button, clicks };
  }

  it("carries the source modifiers and a keyboard-style detail", () => {
    const { button, clicks } = setup();
    try {
      dispatchClickWithModifiers(button, {
        shiftKey: true,
        ctrlKey: false,
        altKey: false,
        metaKey: true,
      });
      expect(clicks).toHaveLength(1);
      expect(clicks[0].shiftKey).toBe(true);
      expect(clicks[0].metaKey).toBe(true);
      expect(clicks[0].ctrlKey).toBe(false);
      expect(clicks[0].altKey).toBe(false);
      expect(clicks[0].detail).toBe(0);
      expect((clicks[0] as PointerEvent).pointerType).toBe("");
    } finally {
      button.remove();
    }
  });

  it("accepts detail and pointerType", () => {
    const { button, clicks } = setup();
    try {
      dispatchClickWithModifiers(
        button,
        { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false },
        { detail: 1, pointerType: "mouse" },
      );
      expect(clicks[0].detail).toBe(1);
      expect((clicks[0] as PointerEvent).pointerType).toBe("mouse");
    } finally {
      button.remove();
    }
  });
});

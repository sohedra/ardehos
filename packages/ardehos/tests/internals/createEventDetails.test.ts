import { describe, expect, it } from "vitest";
import {
  createChangeEventDetails,
  createGenericEventDetails,
} from "#lib/internals/createEventDetails.js";
import { REASONS } from "#lib/internals/reasons.js";

describe("createChangeEventDetails", () => {
  it("flips isCanceled on cancel()", () => {
    const details = createChangeEventDetails(REASONS.none);
    expect(details.isCanceled).toBe(false);
    details.cancel();
    expect(details.isCanceled).toBe(true);
  });

  it("flips isPropagationAllowed on allowPropagation()", () => {
    const details = createChangeEventDetails(REASONS.none);
    expect(details.isPropagationAllowed).toBe(false);
    details.allowPropagation();
    expect(details.isPropagationAllowed).toBe(true);
  });

  it("uses a placeholder event when none is given", () => {
    const details = createChangeEventDetails(REASONS.none);
    expect(details.event).toBeInstanceOf(Event);
    expect(details.event.type).toBe("component");
    expect(details.trigger).toBeUndefined();
  });

  it("keeps the given event and spreads custom properties", () => {
    const event = new Event("click");
    const details = createChangeEventDetails(REASONS.none, event, undefined, { extra: 1 });
    expect(details.event).toBe(event);
    expect(details.extra).toBe(1);
  });
});

describe("createGenericEventDetails", () => {
  it("returns reason, event and custom properties", () => {
    const details = createGenericEventDetails(REASONS.none, undefined, { extra: "x" });
    expect(details.reason).toBe("none");
    expect(details.event.type).toBe("component");
    expect(details.extra).toBe("x");
  });
});

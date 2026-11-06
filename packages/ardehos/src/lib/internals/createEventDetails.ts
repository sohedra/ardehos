// Adapted from Base UI v1.9.0 (packages/react/src/internals/createBaseUIEventDetails.ts). See NOTICE.txt.

type ChangeEventDetail<Reason extends string, Custom extends object> = {
  reason: Reason;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  readonly isCanceled: boolean;
  readonly isPropagationAllowed: boolean;
  trigger: Element | undefined;
} & Custom;

export type ChangeEventDetails<
  Reason extends string,
  Custom extends object = {},
> = Reason extends string ? ChangeEventDetail<Reason, Custom> & {} : never;

type GenericEventDetail<Reason extends string, Custom extends object> = {
  reason: Reason;
  event: Event;
} & Custom;

export type GenericEventDetails<
  Reason extends string,
  Custom extends object = {},
> = Reason extends string ? GenericEventDetail<Reason, Custom> & {} : never;

export function createChangeEventDetails<Reason extends string, Custom extends object = {}>(
  reason: Reason,
  event?: Event,
  trigger?: Element,
  custom?: Custom,
): ChangeEventDetails<Reason, Custom> {
  let canceled = false;
  let propagationAllowed = false;
  const details: ChangeEventDetail<Reason, Custom> = {
    reason,
    event: event ?? new Event("component"),
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    trigger,
    ...(custom as Custom),
  };
  return details as ChangeEventDetails<Reason, Custom>;
}

export function createGenericEventDetails<Reason extends string, Custom extends object = {}>(
  reason: Reason,
  event?: Event,
  custom?: Custom,
): GenericEventDetails<Reason, Custom> {
  const details: GenericEventDetail<Reason, Custom> = {
    reason,
    event: event ?? new Event("component"),
    ...(custom as Custom),
  };
  return details as GenericEventDetails<Reason, Custom>;
}

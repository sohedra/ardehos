// Adapted from Base UI v1.9.0 (packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts). See NOTICE.txt.

type LabelSource = HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null | undefined };

export type UseAriaLabelledByParameters = {
  /** The user's `aria-labelledby`. Wins over every other source. */
  explicitAriaLabelledBy: string | undefined;
  /** The id of the label from the labelable context (none yet, so always `undefined`). */
  labelId: string | undefined;
  /** The element a native `<label>` is associated with, e.g. a hidden input. */
  labelSource: LabelSource | null;
  /**
   * Whether to look for a native `<label>` associated with `labelSource`.
   * @default true
   */
  enableFallback?: boolean;
  /**
   * The id of `labelSource`. A found label without an id gets `${labelSourceId}-label`. Base UI
   * generates an id when this is missing; no caller needs that yet, so such a label is skipped.
   */
  labelSourceId?: string | undefined;
  /** The user's `aria-label`. A non-blank one wins over any associated label. */
  ariaLabel?: string | undefined;
};

/**
 * The `aria-labelledby` for a control that isn't labelable itself (a `<span>`), taking a native
 * `<label>` associated with its hidden input into account.
 *
 * The label lookup runs in an effect, after the DOM is updated, whenever the parameters change.
 * Base UI repeats it after every render to catch a label mounting or unmounting on its own; here
 * that case is picked up on the next parameter change.
 */
export function useAriaLabelledBy(params: () => UseAriaLabelledByParameters): {
  readonly value: string | undefined;
} {
  let fallbackAriaLabelledBy = $state<string | undefined>();

  // A non-blank `aria-label` wins over any associated label, as it does on native inputs.
  const hasAriaLabel = $derived(Boolean(params().ariaLabel?.trim()));

  // Fallback for <span> controls labelled by wrapping/sibling native <label>.
  // An effect, not a derived: it reads the updated DOM (the input's new id, its labels) and may
  // give the label an id, which can't happen on the server or before the DOM is updated.
  $effect(() => {
    const {
      explicitAriaLabelledBy,
      labelId,
      labelSource,
      enableFallback = true,
      labelSourceId,
    } = params();

    fallbackAriaLabelledBy =
      explicitAriaLabelledBy || labelId || hasAriaLabel || !enableFallback
        ? undefined
        : getAriaLabelledBy(labelSource, labelSourceId ? `${labelSourceId}-label` : undefined);
  });

  const value = $derived.by(() => {
    const { explicitAriaLabelledBy, labelId } = params();
    const implicitLabelId = hasAriaLabel ? undefined : labelId;
    return explicitAriaLabelledBy ?? implicitLabelId ?? fallbackAriaLabelledBy;
  });

  return {
    get value() {
      return value;
    },
  };
}

function getAriaLabelledBy(labelSource?: LabelSource | null, generatedLabelId?: string) {
  const label = findAssociatedLabel(labelSource);
  if (!label) {
    return undefined;
  }

  if (!label.id && generatedLabelId) {
    label.id = generatedLabelId;
  }

  return label.id || undefined;
}

function findAssociatedLabel(labelSource?: LabelSource | null) {
  if (!labelSource) {
    return undefined;
  }

  // Fast path before the expensive `.labels` read.
  const parent = labelSource.parentElement;
  if (parent && parent.tagName === "LABEL") {
    return parent as HTMLLabelElement;
  }

  const controlId = labelSource.id;
  if (controlId) {
    const nextSibling = labelSource.nextElementSibling as HTMLLabelElement | null;
    if (nextSibling && nextSibling.htmlFor === controlId) {
      return nextSibling;
    }
  }

  const labels = Array.from(labelSource.labels ?? []);
  if (!controlId) {
    return labels[0];
  }

  // WebKit doesn't update `labels` when the control's id changes, so the `for` label is looked up
  // by id instead, and kept in tree order with the wrapping labels.
  const root = labelSource.getRootNode() as Document | ShadowRoot;
  const forLabel = root.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(controlId)}"]`);
  const candidates = labels.filter((label) => !label.htmlFor);
  if (forLabel) {
    candidates.push(forLabel);
  }
  candidates.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  return candidates[0];
}

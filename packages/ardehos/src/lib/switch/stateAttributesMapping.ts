// Adapted from Base UI v1.9.0 (packages/react/src/switch/stateAttributesMapping.ts). See NOTICE.txt.
import type { StateAttributesMapping } from "#lib/internals/getStateAttributesProps.js";
import * as SwitchRootDataAttributes from "./root/SwitchRootDataAttributes.js";
import type { SwitchRootState } from "./root/types.js";

export const stateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
  // Base UI's `fieldValidityMapping`, inlined until Field is ported.
  valid(value): Record<string, string> | null {
    if (value === null) {
      return null;
    }
    if (value) {
      return { [SwitchRootDataAttributes.valid]: "" };
    }
    return { [SwitchRootDataAttributes.invalid]: "" };
  },
  checked(value): Record<string, string> {
    if (value) {
      return { [SwitchRootDataAttributes.checked]: "" };
    }

    return { [SwitchRootDataAttributes.unchecked]: "" };
  },
};

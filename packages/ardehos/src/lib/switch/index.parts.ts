// Adapted from Base UI v1.9.0 (packages/react/src/switch/index.parts.ts). See NOTICE.txt.
import SwitchRootComponent from "./root/SwitchRoot.svelte";
import type {
  SwitchRootChangeEventDetails,
  SwitchRootChangeEventReason,
  SwitchRootProps,
  SwitchRootState,
} from "./root/types.js";
import SwitchThumbComponent from "./thumb/SwitchThumb.svelte";
import type { SwitchThumbProps, SwitchThumbState } from "./thumb/types.js";

// Each part is a `const` merged with a type-only namespace, so `Switch.Root` is both the component
// and the home of `Switch.Root.Props` and friends.
export const Root = SwitchRootComponent;
export declare namespace Root {
  type Props = SwitchRootProps;
  type State = SwitchRootState;
  type ChangeEventReason = SwitchRootChangeEventReason;
  type ChangeEventDetails = SwitchRootChangeEventDetails;
}

export const Thumb = SwitchThumbComponent;
export declare namespace Thumb {
  type Props = SwitchThumbProps;
  type State = SwitchThumbState;
}

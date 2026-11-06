// Adapted from Base UI v1.9.0 (packages/react/src/internals/getStateAttributesProps.ts). See NOTICE.txt.

export type StateAttributesMapping<State> = {
  [K in keyof State]?: (value: State[K]) => Record<string, string> | null;
};

export function getStateAttributesProps<State extends Record<string, unknown>>(
  state: State,
  mapping?: StateAttributesMapping<State>,
): Record<string, string> {
  const props: Record<string, string> = {};

  for (const key in state) {
    const value = state[key];

    if (mapping && Object.prototype.hasOwnProperty.call(mapping, key)) {
      const custom = mapping[key]!(value);
      if (custom != null) {
        Object.assign(props, custom);
      }
      continue;
    }

    if (value === true) {
      props[`data-${key.toLowerCase()}`] = "";
    } else if (value) {
      props[`data-${key.toLowerCase()}`] = String(value);
    }
  }

  return props;
}

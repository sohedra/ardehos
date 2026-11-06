// Adapted from Base UI v1.9.0 (packages/utils/src/visuallyHidden.ts). See NOTICE.txt.

const base =
  "clip-path: inset(50%); overflow: hidden; white-space: nowrap; border: 0; padding: 0; width: 1px; height: 1px;";

export const visuallyHidden: string = `${base} position: fixed; margin: 0; top: 0; left: 0;`;

export const visuallyHiddenInput: string = `${base} margin: -1px; position: absolute;`;

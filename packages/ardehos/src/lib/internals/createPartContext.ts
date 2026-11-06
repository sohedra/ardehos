import { createContext } from "svelte";

export type PartContext<T> = {
  /** Returns the context, or throws the context's message when no provider is above. */
  get(): T;
  set(value: T): T;
  has(): boolean;
  /** Returns the context, or `undefined` when no provider is above. */
  getOptional(): T | undefined;
};

/**
 * Creates a context that parts share, wrapping Svelte's `createContext`. `get()` throws
 * `new Error(message)` outside a provider, since Svelte's own error doesn't say which part is
 * misplaced. Like Svelte's functions, these must be called during component initialisation.
 *
 * @param name The context's name, e.g. `"SwitchRootContext"`. Documents the context at its
 *   definition; the message carries it to users.
 * @param message The error `get()` throws outside a provider.
 */
export function createPartContext<T>(name: string, message: string): PartContext<T> {
  const [get, set, has] = createContext<T>();
  return {
    get() {
      if (!has()) {
        throw new Error(message);
      }
      return get();
    },
    set,
    has,
    getOptional() {
      return has() ? get() : undefined;
    },
  };
}

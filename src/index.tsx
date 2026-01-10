/**
 * @file src/index.tsx
 * @author leon.wang
 */

import { create, StoreApi, UseBoundStore, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo, useSyncExternalStore } from 'react';

/**
 * Global state storage
 */
const globalStates = new Map<string, UseBoundStore<StoreApi<unknown>>>();

/**
 * Clear all global states (for testing purposes)
 * @internal
 */
export function __clearAllStates__() {
  globalStates.clear();
}

/**
 * Storage type for persistence
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'none';

/**
 * Helper type for setter value - supports partial updates for objects
 */
type SetterValue<T> = T extends Record<string, unknown>
  ? Partial<T> | ((prev: T) => T)
  : T | ((prev: T) => T);

/**
 * Internal store state structure
 */
type StoreState<T> = {
  value: T;
  setValue: (value: SetterValue<T> | ((prev: T) => T)) => void;
  reset: () => void;
};

/**
 * Options for useGlobalState
 */
export interface UseGlobalStateOptions {
  /**
   * Enable persistence and specify storage type
   * @default 'none'
   */
  storage?: StorageType;
  /**
   * Custom storage key prefix
   * @default 'global-state'
   */
  storageKey?: string;
}

/**
 * Universal global state hook - supports both simple values and objects
 * Performance optimized with selector pattern
 *
 * @param key - Unique key for the state
 * @param initialState - Initial state (any type)
 * @param options - Configuration options including persistence
 * @returns [state, setState, resetState]
 *
 * @example
 * // Simple value (number, string, boolean)
 * const [count, setCount, resetCount] = useGlobalState('counter', 0);
 * setCount(5);
 * setCount(prev => prev + 1);
 *
 * // Object state - supports partial updates
 * const [user, setUser, resetUser] = useGlobalState('user', {
 *   name: 'John',
 *   email: 'john@example.com',
 * });
 * setUser({ name: 'Jane' }); // Partial update
 *
 * // With localStorage persistence
 * const [settings, setSettings] = useGlobalState('settings', { theme: 'dark' }, {
 *   storage: 'localStorage'
 * });
 *
 * // With sessionStorage persistence
 * const [tempData, setTempData] = useGlobalState('temp', { foo: 'bar' }, {
 *   storage: 'sessionStorage',
 *   storageKey: 'my-app'
 * });
 *
 * // For non-React usage, see: getGlobalState, setGlobalState, subscribeGlobalState, resetGlobalState
 */
export function useGlobalState<T>(
  key: string,
  initialState: T,
  options?: UseGlobalStateOptions
): [T, (value: SetterValue<T>) => void, () => void] {
  const { storage = 'none', storageKey = 'global-state' } = options || {};

  if (!globalStates.has(key)) {
    const isObject = typeof initialState === 'object' && initialState !== null && !Array.isArray(initialState);

    const stateCreator: StateCreator<StoreState<T>, [], []> = (set) => ({
      value: initialState,
      setValue: (value) => {
        if (typeof value === 'function') {
          // Functional update
          set((state) => ({ value: (value as (prev: T) => T)(state.value) }));
        } else if (isObject && typeof value === 'object' && value !== null) {
          // Partial update for objects
          set((state) => ({ value: { ...state.value, ...value } as T }));
        } else {
          // Direct value update
          set({ value: value as T });
        }
      },
      reset: () => set({ value: initialState }),
    });

    let store: UseBoundStore<StoreApi<StoreState<T>>>;

    if (storage !== 'none') {
      // Create store with persistence
      const storageImpl = storage === 'localStorage' ? localStorage : sessionStorage;

      store = create<StoreState<T>>()(
        persist(stateCreator, {
          name: `${storageKey}-${key}`,
          storage: createJSONStorage(() => storageImpl),
        })
      );
    } else {
      // Create store without persistence
      store = create<StoreState<T>>(stateCreator);
    }

    globalStates.set(key, store as UseBoundStore<StoreApi<unknown>>);
  }

  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  // Performance optimization: use selector to only subscribe to value
  const value = store((state) => state.value);

  // Memoize actions to prevent unnecessary re-renders
  // Use store's internal methods directly for better stability
  const setValue = useMemo(
    () => (value: SetterValue<T>) => store.getState().setValue(value),
    [store]
  );

  const reset = useMemo(
    () => () => store.getState().reset(),
    [store]
  );

  return [value, setValue, reset];
}

/**
 * Advanced hook with custom selector for fine-grained subscriptions
 * Only re-renders when selected value changes
 *
 * @example
 * // Only subscribe to user name, not the whole user object
 * const userName = useGlobalSelector('user', (state) => state.name);
 *
 * // Multiple values
 * const { name, email } = useGlobalSelector(
 *   'user',
 *   (state) => ({ name: state.name, email: state.email })
 * );
 *
 * // With custom equality function (shallow comparison)
 * const user = useGlobalSelector(
 *   'user',
 *   (state) => ({ name: state.name, email: state.email }),
 *   (a, b) => a.name === b.name && a.email === b.email
 * );
 */
export function useGlobalSelector<T, R>(
  key: string,
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): R {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  if (!store) {
    throw new Error(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
  }

  // If no custom equality function, use zustand's default behavior
  if (equalityFn === Object.is) {
    return store((state) => selector(state.value));
  }

  // For custom equality function, use useSyncExternalStore
  const subscribe = useMemo(
    () => (callback: () => void) => store.subscribe(callback),
    [store]
  );

  const getSnapshot = useMemo(
    () => () => selector(store.getState().value),
    [store, selector]
  );

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}

/**
 * Hook to get setter function only (doesn't subscribe to state changes)
 * Useful when you only need to update state without reading it
 *
 * @example
 * const setCount = useGlobalSetter<number>('counter');
 * setCount(5);
 * setCount(prev => prev + 1);
 */
export function useGlobalSetter<T>(key: string): (value: SetterValue<T>) => void {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  if (!store) {
    throw new Error(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
  }

  // Return memoized setter function to prevent re-renders
  // Use closure to ensure we always get the latest setValue method
  return useMemo(
    () => (value: SetterValue<T>) => store.getState().setValue(value),
    [store]
  );
}

/**
 * Get global state value (for non-React usage)
 * @example
 * const count = getGlobalState<number>('counter');
 */
export function getGlobalState<T>(key: string): T | undefined {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;
  return store?.getState().value;
}

/**
 * Set global state value (for non-React usage)
 * @example
 * setGlobalState('counter', 5);
 * setGlobalState('counter', prev => prev + 1);
 * setGlobalState('user', { name: 'Jane' }); // Partial update for objects
 */
export function setGlobalState<T>(key: string, value: SetterValue<T>): void {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  if (!store) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
    }
    return;
  }

  store.getState().setValue(value);
}

/**
 * Subscribe to global state changes (for non-React usage)
 * Returns unsubscribe function
 * @example
 * const unsubscribe = subscribeGlobalState('counter', (newValue, prevValue) => {
 *   console.log('Counter changed from', prevValue, 'to', newValue);
 * });
 * // Later: unsubscribe();
 */
export function subscribeGlobalState<T>(
  key: string,
  callback: (newValue: T, prevValue: T) => void
): () => void {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  if (!store) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
    }
    // Return no-op unsubscribe function
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  let prevValue = store.getState().value;

  // Use zustand's subscribe with selector for better performance
  return store.subscribe((state) => {
    const newValue = state.value;
    // Use Object.is for better comparison (handles NaN, -0, +0)
    if (!Object.is(newValue, prevValue)) {
      callback(newValue, prevValue);
      prevValue = newValue;
    }
  });
}

/**
 * Reset global state to initial value (for non-React usage)
 * @example
 * resetGlobalState('counter');
 */
export function resetGlobalState(key: string): void {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<Pick<StoreState<unknown>, 'reset'>>>;

  if (!store) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
    }
    return;
  }

  store.getState().reset();
}

export default useGlobalState;

/**
 * @file src/index.tsx
 * @author leon.wang
 */

import { create, StoreApi, UseBoundStore, StateCreator } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { useMemo, useRef, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as React from 'react';

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
  /**
   * Enable Redux DevTools integration
   * @default true in development, false in production
   */
  enableDevtools?: boolean;
}

/**
 * Universal global state hook - supports both simple values and objects
 * Performance optimized with selector pattern and automatic Redux DevTools integration
 *
 * @param key - Unique key for the state
 * @param initialState - Initial state (any type)
 * @param options - Configuration options including persistence and devtools
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
 *   age: 30
 * });
 * setUser({ name: 'Jane' }); // Partial update - only updates name field
 * setUser(prev => ({ ...prev, age: prev.age + 1 })); // Functional update
 *
 * // With localStorage persistence (DevTools enabled by default in development)
 * const [settings, setSettings] = useGlobalState('settings', { theme: 'dark' }, {
 *   storage: 'localStorage'
 * });
 *
 * // With sessionStorage persistence and custom storage key
 * const [tempData, setTempData] = useGlobalState('temp', { foo: 'bar' }, {
 *   storage: 'sessionStorage',
 *   storageKey: 'my-app'
 * });
 *
 * // Disable DevTools in development
 * const [privateData, setPrivateData] = useGlobalState('private', {}, {
 *   enableDevtools: false
 * });
 *
 * // Force enable DevTools in production (not recommended)
 * const [debugData, setDebugData] = useGlobalState('debug', {}, {
 *   enableDevtools: true
 * });
 *
 * // For non-React usage, see: getGlobalState, setGlobalState, subscribeGlobalState, resetGlobalState
 */
export function useGlobalState<T>(
  key: string,
  initialState: T,
  options?: UseGlobalStateOptions
): [T, (value: SetterValue<T>) => void, () => void] {
  const {
    storage = 'none',
    storageKey = 'global-state',
    // Auto-enable Redux DevTools in development for better debugging experience
    enableDevtools = process.env.NODE_ENV !== 'production'
  } = options || {};

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

    // Compose middlewares based on options
    // Middleware order: devtools(persist(...)) ensures all state changes are tracked
    if (storage !== 'none' && enableDevtools) {
      // Both persistence and devtools - best for production-ready features
      const storageImpl = storage === 'localStorage' ? localStorage : sessionStorage;

      store = create<StoreState<T>>()(
        devtools(
          persist(stateCreator, {
            name: `${storageKey}-${key}`,
            storage: createJSONStorage(() => storageImpl),
          }),
          { name: `GlobalState:${key}` }
        )
      );
    } else if (storage !== 'none') {
      // Only persistence - production mode without debugging
      const storageImpl = storage === 'localStorage' ? localStorage : sessionStorage;

      store = create<StoreState<T>>()(
        persist(stateCreator, {
          name: `${storageKey}-${key}`,
          storage: createJSONStorage(() => storageImpl),
        })
      );
    } else if (enableDevtools) {
      // Only devtools - development mode for debugging
      store = create<StoreState<T>>()(devtools(stateCreator, { name: `GlobalState:${key}` }));
    } else {
      // No middleware - minimal overhead
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
 * Automatically detects return type and uses appropriate comparison mode
 *
 * @param key - Global state key
 * @param selector - Function to select part of the state
 * @param equalityMode - Optional comparison mode:
 *   - undefined (default): Auto-detect based on return type (shallow for objects/arrays, Object.is for primitives)
 *   - 'shallow': Force shallow comparison
 *
 * @example
 * // Auto mode: uses Object.is for primitive
 * const userName = useGlobalSelector('user', (state) => state.name);
 *
 * // Auto mode: uses shallow for object
 * const userInfo = useGlobalSelector(
 *   'user',
 *   (state) => ({ name: state.name, email: state.email })
 * );
 *
 * // Force shallow comparison
 * const userInfo = useGlobalSelector(
 *   'user',
 *   (state) => ({ name: state.name, email: state.email }),
 *   'shallow'
 * );
 */
export function useGlobalSelector<T, R>(
  key: string,
  selector: (state: T) => R,
  equalityMode?: 'shallow'
): R {
  const store = globalStates.get(key) as UseBoundStore<StoreApi<StoreState<T>>>;

  if (!store) {
    throw new Error(`Global state with key "${key}" not found. Initialize it with useGlobalState first.`);
  }

  // Memoize selector to avoid recreation
  const selectorRef = useRef(selector);

  // Keep ref updated
  useEffect(() => {
    selectorRef.current = selector;
  });

  const wrappedSelector = useCallback(
    (state: StoreState<T>) => selectorRef.current(state.value),
    []
  );

  // Auto-detect comparison mode if not specified
  if (equalityMode === undefined) {
    // Get initial value to detect type
    const initialValue = wrappedSelector(store.getState());
    const shouldUseShallow =
      initialValue !== null &&
      typeof initialValue === 'object' &&
      !React.isValidElement(initialValue);

    if (shouldUseShallow) {
      return store(useShallow(wrappedSelector)) as R;
    }
    return store(wrappedSelector);
  }

  // Force shallow comparison if explicitly requested
  if (equalityMode === 'shallow') {
    return store(useShallow(wrappedSelector)) as R;
  }

  // Default: use zustand's default Object.is comparison
  return store(wrappedSelector);
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

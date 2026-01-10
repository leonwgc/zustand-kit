/**
 * @file src/index.tsx
 * @author leon.wang
 */
/**
 * Clear all global states (for testing purposes)
 * @internal
 */
export declare function __clearAllStates__(): void;
/**
 * Storage type for persistence
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'none';
/**
 * Helper type for setter value - supports partial updates for objects
 */
type SetterValue<T> = T extends Record<string, unknown> ? Partial<T> | ((prev: T) => T) : T | ((prev: T) => T);
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
export declare function useGlobalState<T>(key: string, initialState: T, options?: UseGlobalStateOptions): [T, (value: SetterValue<T>) => void, () => void];
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
export declare function useGlobalSelector<T, R>(key: string, selector: (state: T) => R, equalityFn?: (a: R, b: R) => boolean): R;
/**
 * Hook to get setter function only (doesn't subscribe to state changes)
 * Useful when you only need to update state without reading it
 *
 * @example
 * const setCount = useGlobalSetter<number>('counter');
 * setCount(5);
 * setCount(prev => prev + 1);
 */
export declare function useGlobalSetter<T>(key: string): (value: SetterValue<T>) => void;
/**
 * Get global state value (for non-React usage)
 * @example
 * const count = getGlobalState<number>('counter');
 */
export declare function getGlobalState<T>(key: string): T | undefined;
/**
 * Set global state value (for non-React usage)
 * @example
 * setGlobalState('counter', 5);
 * setGlobalState('counter', prev => prev + 1);
 * setGlobalState('user', { name: 'Jane' }); // Partial update for objects
 */
export declare function setGlobalState<T>(key: string, value: SetterValue<T>): void;
/**
 * Subscribe to global state changes (for non-React usage)
 * Returns unsubscribe function
 * @example
 * const unsubscribe = subscribeGlobalState('counter', (newValue, prevValue) => {
 *   console.log('Counter changed from', prevValue, 'to', newValue);
 * });
 * // Later: unsubscribe();
 */
export declare function subscribeGlobalState<T>(key: string, callback: (newValue: T, prevValue: T) => void): () => void;
/**
 * Reset global state to initial value (for non-React usage)
 * @example
 * resetGlobalState('counter');
 */
export declare function resetGlobalState(key: string): void;
export default useGlobalState;

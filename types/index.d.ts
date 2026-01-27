/**
 * Configure global DevTools integration
 * @param enabled - Whether to enable Redux DevTools integration for all global states
 * @example
 * // Disable DevTools in development
 * configureDevtools(false);
 *
 * // Enable DevTools in production (not recommended)
 * configureDevtools(true);
 */
export declare function configureDevtools(enabled: boolean): void;
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
 * Simplified to allow partial updates without type assertions
 */
type SetterValue<T> = T | Partial<T> | ((prev: T) => T);
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
 * // Configure DevTools globally (before creating states)
 * import { configureDevtools } from 'zustand-kit';
 * configureDevtools(false); // Disable DevTools
 *
 * // For non-React usage, see: getGlobalState, setGlobalState, subscribeGlobalState, resetGlobalState
 */
export declare function useGlobalState<T>(key: string, initialState: T, options?: UseGlobalStateOptions): [T, (value: SetterValue<T>) => void, () => void];
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
 *   - false: Force Object.is comparison
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
 *
 * // Force Object.is comparison (even for objects)
 * const userInfo = useGlobalSelector(
 *   'user',
 *   (state) => ({ name: state.name, email: state.email }),
 *   false
 * );
 */
export declare function useGlobalSelector<T, R>(key: string, selector: (state: T) => R, equalityMode?: 'shallow' | false): R;
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

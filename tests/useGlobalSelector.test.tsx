/**
 * @file tests/useGlobalSelector.test.tsx
 * @description Test suite for useGlobalSelector hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalState, useGlobalSelector, __clearAllStates__ } from '../src/index';

describe('useGlobalSelector', () => {
  interface User {
    name: string;
    email: string;
    age: number;
  }

  const initialUser: User = {
    name: 'John',
    email: 'john@example.com',
    age: 30,
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __clearAllStates__();
  });

  it('should select a specific field', () => {
    renderHook(() => useGlobalState('user-1', initialUser));
    const { result } = renderHook(() =>
      useGlobalSelector<User, string>('user-1', (state) => state.name)
    );

    expect(result.current).toBe('John');
  });

  it('should update when selected field changes', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-2', initialUser));
    const { result: selectorResult } = renderHook(() =>
      useGlobalSelector<User, string>('user-2', (state) => state.name)
    );

    expect(selectorResult.current).toBe('John');

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ name: 'Jane' });
    });

    expect(selectorResult.current).toBe('Jane');
  });

  it('should not re-render when unrelated field changes (default Object.is)', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-3', initialUser));

    let renderCount = 0;
    const { result: selectorResult } = renderHook(() => {
      renderCount++;
      return useGlobalSelector<User, string>('user-3', (state) => state.name);
    });

    expect(selectorResult.current).toBe('John');
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ age: 31 });
    });

    // Should not re-render because name hasn't changed
    expect(selectorResult.current).toBe('John');
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ name: 'Jane' });
    });

    // Should re-render now
    expect(selectorResult.current).toBe('Jane');
    expect(renderCount).toBe(2);
  });

  it('should use shallow comparison when equalityMode is "shallow"', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-4', initialUser));

    let renderCount = 0;
    const { result: selectorResult } = renderHook(() => {
      renderCount++;
      return useGlobalSelector<User, { name: string; email: string }>(
        'user-4',
        (state) => ({ name: state.name, email: state.email }),
        'shallow'
      );
    });

    expect(selectorResult.current).toEqual({ name: 'John', email: 'john@example.com' });
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ age: 31 });
    });

    // Should not re-render because name and email haven't changed
    expect(selectorResult.current).toEqual({ name: 'John', email: 'john@example.com' });
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ name: 'Jane' });
    });

    // Should re-render now
    expect(selectorResult.current).toEqual({ name: 'Jane', email: 'john@example.com' });
    expect(renderCount).toBe(2);
  });

  it('should handle array selection with shallow comparison', () => {
    interface State {
      items: string[];
      count: number;
    }

    const initialState: State = {
      items: ['a', 'b', 'c'],
      count: 0,
    };

    const { result: stateResult } = renderHook(() => useGlobalState('array-state', initialState));

    let renderCount = 0;
    const { result: selectorResult } = renderHook(() => {
      renderCount++;
      return useGlobalSelector<State, string[]>(
        'array-state',
        (state) => state.items,
        'shallow'
      );
    });

    expect(selectorResult.current).toEqual(['a', 'b', 'c']);
    expect(renderCount).toBe(1);

    act(() => {
      const [, setState] = stateResult.current;
      setState({ count: 1 });
    });

    // Should not re-render because items array hasn't changed (same reference)
    expect(selectorResult.current).toEqual(['a', 'b', 'c']);
    expect(renderCount).toBe(1);

    act(() => {
      const [, setState] = stateResult.current;
      setState({ items: ['a', 'b', 'c', 'd'] });
    });

    // Should re-render now
    expect(selectorResult.current).toEqual(['a', 'b', 'c', 'd']);
    expect(renderCount).toBe(2);
  });

  it('should work with nested object selection', () => {
    interface NestedState {
      user: {
        profile: {
          firstName: string;
          lastName: string;
        };
        settings: {
          theme: string;
        };
      };
    }

    const initialState: NestedState = {
      user: {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        settings: {
          theme: 'dark',
        },
      },
    };

    const { result: stateResult } = renderHook(() => useGlobalState('nested-state', initialState));

    const { result: selectorResult } = renderHook(() =>
      useGlobalSelector<NestedState, string>(
        'nested-state',
        (state) => state.user.profile.firstName
      )
    );

    expect(selectorResult.current).toBe('John');

    act(() => {
      const [, setState] = stateResult.current;
      setState({
        user: {
          profile: { firstName: 'Jane', lastName: 'Doe' },
          settings: { theme: 'dark' },
        },
      });
    });

    expect(selectorResult.current).toBe('Jane');
  });

  it('should throw error when state does not exist', () => {
    expect(() => {
      renderHook(() =>
        useGlobalSelector<User, string>('non-existent', (state) => state.name)
      );
    }).toThrow('Global state with key "non-existent" not found');
  });

  it('should handle multiple selectors on same state', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-5', initialUser));

    const { result: nameResult } = renderHook(() =>
      useGlobalSelector<User, string>('user-5', (state) => state.name)
    );

    const { result: emailResult } = renderHook(() =>
      useGlobalSelector<User, string>('user-5', (state) => state.email)
    );

    expect(nameResult.current).toBe('John');
    expect(emailResult.current).toBe('john@example.com');

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ name: 'Jane' });
    });

    expect(nameResult.current).toBe('Jane');
    expect(emailResult.current).toBe('john@example.com');
  });

  it('should auto-detect and use shallow comparison for object return type', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-6', initialUser));

    let renderCount = 0;
    const { result: selectorResult } = renderHook(() => {
      renderCount++;
      // No equalityMode specified - should auto-detect and use shallow
      return useGlobalSelector<User, { name: string; email: string }>(
        'user-6',
        (state) => ({ name: state.name, email: state.email })
      );
    });

    expect(selectorResult.current).toEqual({ name: 'John', email: 'john@example.com' });
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ age: 31 });
    });

    // Should not re-render because name and email haven't changed (auto shallow comparison)
    expect(selectorResult.current).toEqual({ name: 'John', email: 'john@example.com' });
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ name: 'Jane' });
    });

    // Should re-render now
    expect(selectorResult.current).toEqual({ name: 'Jane', email: 'john@example.com' });
    expect(renderCount).toBe(2);
  });

  it('should auto-detect and use Object.is for primitive return type', () => {
    const { result: stateResult } = renderHook(() => useGlobalState('user-7', initialUser));

    let renderCount = 0;
    const { result: selectorResult } = renderHook(() => {
      renderCount++;
      // No equalityMode specified - should auto-detect and use Object.is
      return useGlobalSelector<User, string>('user-7', (state) => state.name);
    });

    expect(selectorResult.current).toBe('John');
    expect(renderCount).toBe(1);

    act(() => {
      const [, setUser] = stateResult.current;
      setUser({ age: 31 });
    });

    // Should not re-render because name hasn't changed
    expect(selectorResult.current).toBe('John');
    expect(renderCount).toBe(1);
  });
});

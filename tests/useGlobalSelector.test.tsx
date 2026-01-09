/**
 * @file tests/useGlobalSelector.test.tsx
 * @description Test suite for useGlobalSelector hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalState, useGlobalSelector } from '../src/index';

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

  it('should throw error when state does not exist', () => {
    expect(() => {
      renderHook(() =>
        useGlobalSelector<User, string>('non-existent', (state) => state.name)
      );
    }).toThrow('Global state with key "non-existent" not found');
  });
});

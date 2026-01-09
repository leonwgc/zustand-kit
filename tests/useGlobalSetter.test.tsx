/**
 * @file tests/useGlobalSetter.test.tsx
 * @description Test suite for useGlobalSetter hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalState, useGlobalSetter } from '../src/index';

describe('useGlobalSetter', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Basic functionality', () => {
    it('should get setter function', () => {
      renderHook(() => useGlobalState('counter', 0));
      const { result } = renderHook(() => useGlobalSetter<number>('counter'));

      expect(typeof result.current).toBe('function');
    });

    it('should update state using setter', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('counter', 0));
      const { result: setterResult } = renderHook(() => useGlobalSetter<number>('counter'));

      act(() => {
        setterResult.current(42);
      });

      expect(stateResult.current[0]).toBe(42);
    });

    it('should support functional updates', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('counter', 0));
      const { result: setterResult } = renderHook(() => useGlobalSetter<number>('counter'));

      act(() => {
        setterResult.current((prev) => prev + 5);
      });

      expect(stateResult.current[0]).toBe(5);

      act(() => {
        setterResult.current((prev) => prev * 2);
      });

      expect(stateResult.current[0]).toBe(10);
    });
  });

  describe('Object state updates', () => {
    interface User {
      name: string;
      email: string;
      age: number;
    }

    it('should update object state', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result: stateResult } = renderHook(() => useGlobalState('user', initialUser));
      const { result: setterResult } = renderHook(() => useGlobalSetter<User>('user'));

      act(() => {
        setterResult.current({ name: 'Jane' } as Partial<User>);
      });

      expect(stateResult.current[0].name).toBe('Jane');
      expect(stateResult.current[0].email).toBe('john@example.com');
      expect(stateResult.current[0].age).toBe(30);
    });

    it('should support partial updates', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result: stateResult } = renderHook(() => useGlobalState('user', initialUser));
      const { result: setterResult } = renderHook(() => useGlobalSetter<User>('user'));

      act(() => {
        setterResult.current({ age: 31 } as Partial<User>);
      });

      expect(stateResult.current[0]).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 31,
      });
    });
  });

  describe('Performance characteristics', () => {
    it('should not cause re-render when state changes', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('counter', 0));
      const { result: setterResult, rerender } = renderHook(() => useGlobalSetter<number>('counter'));

      const initialSetter = setterResult.current;

      act(() => {
        stateResult.current[1](100);
      });

      rerender();

      // Setter reference should remain stable
      expect(setterResult.current).toBe(initialSetter);
    });

    it('should work with multiple setter hooks', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('counter', 0));
      const { result: setter1 } = renderHook(() => useGlobalSetter<number>('counter'));
      const { result: setter2 } = renderHook(() => useGlobalSetter<number>('counter'));

      act(() => {
        setter1.current(5);
      });

      expect(stateResult.current[0]).toBe(5);

      act(() => {
        setter2.current((prev) => prev + 3);
      });

      expect(stateResult.current[0]).toBe(8);
    });
  });

  describe('Error handling', () => {
    it('should throw error when state does not exist', () => {
      expect(() => {
        renderHook(() => useGlobalSetter<number>('non-existent-key'));
      }).toThrow('Global state with key "non-existent-key" not found');
    });
  });

  describe('Different data types', () => {
    it('should work with string state', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('text', 'hello'));
      const { result: setterResult } = renderHook(() => useGlobalSetter<string>('text'));

      act(() => {
        setterResult.current('world');
      });

      expect(stateResult.current[0]).toBe('world');
    });

    it('should work with boolean state', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('flag', false));
      const { result: setterResult } = renderHook(() => useGlobalSetter<boolean>('flag'));

      act(() => {
        setterResult.current(true);
      });

      expect(stateResult.current[0]).toBe(true);
    });

    it('should work with array state', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('list', [1, 2, 3]));
      const { result: setterResult } = renderHook(() => useGlobalSetter<number[]>('list'));

      act(() => {
        setterResult.current([4, 5, 6]);
      });

      expect(stateResult.current[0]).toEqual([4, 5, 6]);
    });
  });

  describe('Integration with useGlobalState', () => {
    it('should sync with useGlobalState updates', () => {
      const { result: stateResult } = renderHook(() => useGlobalState('sync', 0));
      const { result: setterResult } = renderHook(() => useGlobalSetter<number>('sync'));

      act(() => {
        stateResult.current[1](10);
      });

      expect(stateResult.current[0]).toBe(10);

      act(() => {
        setterResult.current(20);
      });

      expect(stateResult.current[0]).toBe(20);
    });
  });
});

/**
 * @file tests/useGlobalState.test.tsx
 * @description Test suite for useGlobalState hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGlobalState } from '../src/index';

describe('useGlobalState', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Basic functionality', () => {
    it('should initialize with initial value', () => {
      const { result } = renderHook(() => useGlobalState('test-key', 0));
      const [value] = result.current;
      expect(value).toBe(0);
    });

    it('should update value', () => {
      const { result } = renderHook(() => useGlobalState('test-key', 0));

      act(() => {
        const [, setValue] = result.current;
        setValue(5);
      });

      expect(result.current[0]).toBe(5);
    });

    it('should support functional updates', () => {
      const { result } = renderHook(() => useGlobalState('test-key', 0));

      act(() => {
        const [, setValue] = result.current;
        setValue((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        const [, setValue] = result.current;
        setValue((prev) => prev + 2);
      });

      expect(result.current[0]).toBe(3);
    });

    it('should reset to initial value', () => {
      const { result } = renderHook(() => useGlobalState('test-key', 10));

      act(() => {
        const [, setValue] = result.current;
        setValue(20);
      });

      expect(result.current[0]).toBe(20);

      act(() => {
        const [, , reset] = result.current;
        reset();
      });

      expect(result.current[0]).toBe(10);
    });
  });

  describe('Shared state between components', () => {
    it('should share state between multiple hooks', () => {
      const { result: result1 } = renderHook(() => useGlobalState('shared-key', 0));
      const { result: result2 } = renderHook(() => useGlobalState('shared-key', 0));

      expect(result1.current[0]).toBe(0);
      expect(result2.current[0]).toBe(0);

      act(() => {
        const [, setValue] = result1.current;
        setValue(42);
      });

      expect(result1.current[0]).toBe(42);
      expect(result2.current[0]).toBe(42);
    });

    it('should sync updates across multiple hooks', () => {
      const { result: result1 } = renderHook(() => useGlobalState('sync-key', 1));
      const { result: result2 } = renderHook(() => useGlobalState('sync-key', 1));

      act(() => {
        const [, setValue] = result1.current;
        setValue((prev) => prev + 1);
      });

      expect(result1.current[0]).toBe(2);
      expect(result2.current[0]).toBe(2);

      act(() => {
        const [, setValue] = result2.current;
        setValue((prev) => prev * 2);
      });

      expect(result1.current[0]).toBe(4);
      expect(result2.current[0]).toBe(4);
    });
  });

  describe('Object state with partial updates', () => {
    interface User {
      name: string;
      email: string;
      age: number;
    }

    it('should support object state', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result } = renderHook(() => useGlobalState('user-key', initialUser));

      expect(result.current[0]).toEqual(initialUser);
    });

    it('should support partial updates for object state', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result } = renderHook(() => useGlobalState('user-key', initialUser));

      act(() => {
        const [, setUser] = result.current;
        setUser({ name: 'Jane' });
      });

      expect(result.current[0]).toEqual({
        name: 'Jane',
        email: 'john@example.com',
        age: 30,
      });
    });

    it('should support multiple partial updates', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result } = renderHook(() => useGlobalState('user-key', initialUser));

      act(() => {
        const [, setUser] = result.current;
        setUser({ age: 31 });
      });

      expect(result.current[0].age).toBe(31);

      act(() => {
        const [, setUser] = result.current;
        setUser({ email: 'jane@example.com' });
      });

      expect(result.current[0]).toEqual({
        name: 'John',
        email: 'jane@example.com',
        age: 31,
      });
    });

    it('should support functional updates for objects', () => {
      const initialUser: User = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const { result } = renderHook(() => useGlobalState('user-key', initialUser));

      act(() => {
        const [, setUser] = result.current;
        setUser((prev) => ({
          ...prev,
          age: prev.age + 1,
        }));
      });

      expect(result.current[0].age).toBe(31);
    });
  });

  describe('Persistence with localStorage', () => {
    it('should persist state to localStorage', async () => {
      const { result } = renderHook(() =>
        useGlobalState('persist-key', { count: 0 }, {
          storage: 'localStorage',
          storageKey: 'test-app',
        })
      );

      act(() => {
        const [, setValue] = result.current;
        setValue({ count: 42 });
      });

      await waitFor(() => {
        const stored = localStorage.getItem('test-app-persist-key');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.state.value.count).toBe(42);
      });
    });

    it('should restore state from localStorage', async () => {
      // Pre-populate localStorage
      const storageKey = 'test-app-restore-key';
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          state: { value: { count: 99 } },
          version: 0,
        })
      );

      const { result } = renderHook(() =>
        useGlobalState('restore-key', { count: 0 }, {
          storage: 'localStorage',
          storageKey: 'test-app',
        })
      );

      await waitFor(() => {
        expect(result.current[0].count).toBe(99);
      });
    });
  });

  describe('Persistence with sessionStorage', () => {
    it('should persist state to sessionStorage', async () => {
      const { result } = renderHook(() =>
        useGlobalState('session-key', { data: 'test' }, {
          storage: 'sessionStorage',
          storageKey: 'test-app',
        })
      );

      act(() => {
        const [, setValue] = result.current;
        setValue({ data: 'updated' });
      });

      await waitFor(() => {
        const stored = sessionStorage.getItem('test-app-session-key');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.state.value.data).toBe('updated');
      });
    });
  });

  describe('Different state types', () => {
    it('should work with number state', () => {
      const { result } = renderHook(() => useGlobalState('number-key', 0));

      act(() => {
        const [, setValue] = result.current;
        setValue(42);
      });

      expect(result.current[0]).toBe(42);
    });

    it('should work with string state', () => {
      const { result } = renderHook(() => useGlobalState('string-key', 'hello'));

      act(() => {
        const [, setValue] = result.current;
        setValue('world');
      });

      expect(result.current[0]).toBe('world');
    });

    it('should work with boolean state', () => {
      const { result } = renderHook(() => useGlobalState('boolean-key', false));

      act(() => {
        const [, setValue] = result.current;
        setValue(true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('should work with array state', () => {
      const { result } = renderHook(() => useGlobalState('array-key', [1, 2, 3]));

      act(() => {
        const [, setValue] = result.current;
        setValue([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });

    it('should work with null state', () => {
      const { result } = renderHook(() => useGlobalState<string | null>('null-key', null));

      expect(result.current[0]).toBe(null);

      act(() => {
        const [, setValue] = result.current;
        setValue('not null');
      });

      expect(result.current[0]).toBe('not null');
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid updates', () => {
      const { result } = renderHook(() => useGlobalState('rapid-key', 0));

      act(() => {
        const [, setValue] = result.current;
        for (let i = 1; i <= 10; i++) {
          setValue((prev) => prev + 1);
        }
      });

      expect(result.current[0]).toBe(10);
    });

    it('should handle same key with different initial values', () => {
      const { result: result1 } = renderHook(() => useGlobalState('same-key', 10));
      const { result: result2 } = renderHook(() => useGlobalState('same-key', 999));

      // Second hook should use the existing state, not the new initial value
      expect(result1.current[0]).toBe(10);
      expect(result2.current[0]).toBe(10);
    });

    it('should maintain separate states for different keys', () => {
      const { result: result1 } = renderHook(() => useGlobalState('key1', 1));
      const { result: result2 } = renderHook(() => useGlobalState('key2', 2));

      expect(result1.current[0]).toBe(1);
      expect(result2.current[0]).toBe(2);

      act(() => {
        const [, setValue1] = result1.current;
        setValue1(10);
      });

      expect(result1.current[0]).toBe(10);
      expect(result2.current[0]).toBe(2); // Should not be affected
    });
  });
});

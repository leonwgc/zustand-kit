/**
 * @file tests/non-react-api.test.ts
 * @description Test suite for non-React APIs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useGlobalState,
  initGlobalState,
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState,
} from '../src/index';

describe('Non-React APIs', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getGlobalState', () => {
    it('should get current state value', () => {
      renderHook(() => useGlobalState('counter', 42));

      const value = getGlobalState<number>('counter');
      expect(value).toBe(42);
    });

    it('should return undefined for non-existent state', () => {
      const value = getGlobalState<number>('non-existent');
      expect(value).toBeUndefined();
    });
  });

  describe('setGlobalState', () => {
    it('should set state value', () => {
      const { result } = renderHook(() => useGlobalState('counter', 0));

      act(() => {
        setGlobalState('counter', 50);
      });

      expect(result.current[0]).toBe(50);
    });

    it('should support functional updates', () => {
      const { result } = renderHook(() => useGlobalState('counter-2', 10));

      act(() => {
        setGlobalState('counter-2', (prev: number) => prev + 5);
      });

      expect(result.current[0]).toBe(15);
    });
  });

  describe('subscribeGlobalState', () => {
    it('should subscribe to state changes', () => {
      renderHook(() => useGlobalState('counter-3', 0));

      const callback = vi.fn();
      const unsubscribe = subscribeGlobalState<number>('counter-3', callback);

      act(() => {
        setGlobalState('counter-3', 5);
      });

      expect(callback).toHaveBeenCalledWith(5, 0);

      unsubscribe();
    });

    it('should unsubscribe correctly', () => {
      renderHook(() => useGlobalState('counter-4', 0));

      const callback = vi.fn();
      const unsubscribe = subscribeGlobalState<number>('counter-4', callback);

      act(() => {
        setGlobalState('counter-4', 5);
      });
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      act(() => {
        setGlobalState('counter-4', 10);
      });
      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('resetGlobalState', () => {
    it('should reset state to initial value', async () => {
      const { result } = renderHook(() => useGlobalState('counter-5', 10));

      act(() => {
        result.current[1](50);
      });

      expect(result.current[0]).toBe(50);

      act(() => {
        resetGlobalState('counter-5');
      });

      await waitFor(() => {
        expect(result.current[0]).toBe(10);
      });
    });
  });

  describe('Integration', () => {
    it('should work together seamlessly', () => {
      renderHook(() => useGlobalState('counter-6', 0));

      expect(getGlobalState<number>('counter-6')).toBe(0);

      act(() => {
        setGlobalState('counter-6', 10);
      });
      expect(getGlobalState<number>('counter-6')).toBe(10);

      const callback = vi.fn();
      const unsubscribe = subscribeGlobalState<number>('counter-6', callback);

      act(() => {
        setGlobalState('counter-6', (prev: number) => prev + 5);
      });
      expect(getGlobalState<number>('counter-6')).toBe(15);
      expect(callback).toHaveBeenCalledWith(15, 10);

      unsubscribe();
    });
  });

  describe('initGlobalState', () => {
    it('should initialize state without a React component', () => {
      initGlobalState('init-counter', 100);
      expect(getGlobalState<number>('init-counter')).toBe(100);
    });

    it('should allow setGlobalState before any React component mounts', () => {
      initGlobalState('init-counter-2', 0);

      act(() => {
        setGlobalState('init-counter-2', 42);
      });

      expect(getGlobalState<number>('init-counter-2')).toBe(42);
    });

    it('should allow subscribeGlobalState before any React component mounts', () => {
      initGlobalState('init-counter-3', 0);

      const callback = vi.fn();
      const unsubscribe = subscribeGlobalState<number>('init-counter-3', callback);

      act(() => {
        setGlobalState('init-counter-3', 7);
      });

      expect(callback).toHaveBeenCalledWith(7, 0);
      unsubscribe();
    });

    it('should allow resetGlobalState before any React component mounts', () => {
      initGlobalState('init-counter-4', 10);

      act(() => {
        setGlobalState('init-counter-4', 99);
      });
      expect(getGlobalState<number>('init-counter-4')).toBe(99);

      act(() => {
        resetGlobalState('init-counter-4');
      });
      expect(getGlobalState<number>('init-counter-4')).toBe(10);
    });

    it('should support object state with partial updates', () => {
      initGlobalState('init-user', { name: 'John', age: 30 });

      act(() => {
        setGlobalState('init-user', { age: 31 });
      });

      expect(getGlobalState<{ name: string; age: number }>('init-user')).toEqual({
        name: 'John',
        age: 31,
      });
    });

    it('should be idempotent - calling twice does not reset state', () => {
      initGlobalState('init-idempotent', 0);

      act(() => {
        setGlobalState('init-idempotent', 50);
      });

      // Second call should be a no-op
      initGlobalState('init-idempotent', 0);

      expect(getGlobalState<number>('init-idempotent')).toBe(50);
    });

    it('should sync with React components that use the same key', () => {
      initGlobalState('init-shared', 5);

      act(() => {
        setGlobalState('init-shared', 20);
      });

      // React component connects to the already-initialized store
      const { result } = renderHook(() => useGlobalState('init-shared', 5));
      expect(result.current[0]).toBe(20);

      // Further updates from non-React code reflect in the component
      act(() => {
        setGlobalState('init-shared', 99);
      });
      expect(result.current[0]).toBe(99);
    });
  });
});

/**
 * @file tests/non-react-api.test.ts
 * @description Test suite for the non-React APIs.
 *
 * NOTE: Intentionally does NOT import from @testing-library/react.
 * These tests exercise the library the way it would be used in Node scripts,
 * SSR entry points, workers, service files, or any code path that runs
 * before/without a React tree.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initGlobalState,
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState,
  configureDevtools,
  __clearAllStates__,
} from '../src/index';

describe('Non-React APIs', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __clearAllStates__();
    // Re-enable devtools default for each test (jsdom => NODE_ENV=test => true).
    configureDevtools(process.env.NODE_ENV !== 'production');
  });

  // ---------------------------------------------------------------------------
  // initGlobalState
  // ---------------------------------------------------------------------------
  describe('initGlobalState', () => {
    it('registers a store and makes the value readable via getGlobalState', () => {
      initGlobalState('count', 42);
      expect(getGlobalState<number>('count')).toBe(42);
    });

    it('supports primitive, object, array, and null initial values', () => {
      initGlobalState('num', 1);
      initGlobalState('str', 'hi');
      initGlobalState('bool', true);
      initGlobalState('obj', { a: 1 });
      initGlobalState('arr', [1, 2, 3]);
      initGlobalState<string | null>('nullable', null);

      expect(getGlobalState<number>('num')).toBe(1);
      expect(getGlobalState<string>('str')).toBe('hi');
      expect(getGlobalState<boolean>('bool')).toBe(true);
      expect(getGlobalState<{ a: number }>('obj')).toEqual({ a: 1 });
      expect(getGlobalState<number[]>('arr')).toEqual([1, 2, 3]);
      expect(getGlobalState<string | null>('nullable')).toBeNull();
    });

    it('is idempotent — second call with same key is a no-op', () => {
      initGlobalState('k', 1);
      initGlobalState('k', 999); // ignored
      expect(getGlobalState<number>('k')).toBe(1);
    });

    it('preserves value across repeated init calls even after updates', () => {
      initGlobalState('k', 1);
      setGlobalState('k', 5);
      initGlobalState('k', 999); // still no-op
      expect(getGlobalState<number>('k')).toBe(5);
    });

    it('does not touch storage when storage option is omitted', () => {
      initGlobalState('mem', { a: 1 });
      expect(localStorage.getItem('global-state-mem')).toBeNull();
      expect(sessionStorage.getItem('global-state-mem')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // getGlobalState
  // ---------------------------------------------------------------------------
  describe('getGlobalState', () => {
    it('returns the current value', () => {
      initGlobalState('k', 10);
      expect(getGlobalState<number>('k')).toBe(10);
    });

    it('reflects the latest value after setGlobalState', () => {
      initGlobalState('k', 0);
      setGlobalState('k', 7);
      expect(getGlobalState<number>('k')).toBe(7);
    });

    it('returns undefined for an unknown key', () => {
      expect(getGlobalState<number>('missing')).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // setGlobalState
  // ---------------------------------------------------------------------------
  describe('setGlobalState', () => {
    it('replaces primitive values', () => {
      initGlobalState('c', 0);
      setGlobalState('c', 10);
      expect(getGlobalState<number>('c')).toBe(10);
    });

    it('supports functional updates for primitives', () => {
      initGlobalState('c', 10);
      setGlobalState<number>('c', (prev) => prev + 5);
      expect(getGlobalState<number>('c')).toBe(15);
    });

    it('performs partial (shallow-merge) updates on object state', () => {
      initGlobalState('user', { name: 'John', age: 30, email: 'j@x.com' });
      setGlobalState('user', { age: 31 });
      expect(getGlobalState('user')).toEqual({
        name: 'John',
        age: 31,
        email: 'j@x.com',
      });
    });

    it('supports functional updates for objects', () => {
      initGlobalState('user', { name: 'John', age: 30 });
      setGlobalState<{ name: string; age: number }>('user', (prev) => ({
        ...prev,
        age: prev.age + 1,
      }));
      expect(getGlobalState('user')).toEqual({ name: 'John', age: 31 });
    });

    it('replaces (not merges) when new value is an array', () => {
      initGlobalState('arr', [1, 2, 3]);
      setGlobalState('arr', [9, 8]);
      expect(getGlobalState<number[]>('arr')).toEqual([9, 8]);
    });

    it('replaces the entire value when previous state was null', () => {
      initGlobalState<{ name: string; age: number } | null>('u', null);
      setGlobalState('u', { name: 'wgc', age: 18 });
      expect(getGlobalState('u')).toEqual({ name: 'wgc', age: 18 });
    });

    it('merges into existing object after previously being null', () => {
      initGlobalState<{ name: string; age?: number } | null>('u', null);
      setGlobalState('u', { name: 'wgc', age: 18 });
      setGlobalState('u', { name: 'leon' }); // shallow merge
      expect(getGlobalState('u')).toEqual({ name: 'leon', age: 18 });
    });

    it('warns and no-ops when the key does not exist', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setGlobalState('nope', 1);
      expect(warn).toHaveBeenCalled();
      expect(getGlobalState('nope')).toBeUndefined();
      warn.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // subscribeGlobalState
  // ---------------------------------------------------------------------------
  describe('subscribeGlobalState', () => {
    it('fires callback with (newValue, prevValue) on change', () => {
      initGlobalState('c', 0);
      const cb = vi.fn();
      const unsub = subscribeGlobalState<number>('c', cb);

      setGlobalState('c', 5);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(5, 0);

      setGlobalState('c', 8);
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenLastCalledWith(8, 5);

      unsub();
    });

    it('stops firing after unsubscribe', () => {
      initGlobalState('c', 0);
      const cb = vi.fn();
      const unsub = subscribeGlobalState<number>('c', cb);

      setGlobalState('c', 1);
      unsub();
      setGlobalState('c', 2);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('does not fire when the value did not actually change (Object.is)', () => {
      initGlobalState('c', 5);
      const cb = vi.fn();
      subscribeGlobalState<number>('c', cb);

      setGlobalState('c', 5); // same primitive
      expect(cb).not.toHaveBeenCalled();
    });

    it('treats NaN as equal to NaN (Object.is semantics)', () => {
      initGlobalState<number>('n', NaN);
      const cb = vi.fn();
      subscribeGlobalState<number>('n', cb);

      setGlobalState('n', NaN);
      expect(cb).not.toHaveBeenCalled();
    });

    it('supports multiple independent listeners', () => {
      initGlobalState('c', 0);
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      const unsub1 = subscribeGlobalState<number>('c', cb1);
      const unsub2 = subscribeGlobalState<number>('c', cb2);

      setGlobalState('c', 1);
      expect(cb1).toHaveBeenCalledWith(1, 0);
      expect(cb2).toHaveBeenCalledWith(1, 0);

      unsub1();
      setGlobalState('c', 2);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(2);

      unsub2();
    });

    it('fires for object updates and reflects merged previous/next value', () => {
      initGlobalState('u', { name: 'John', age: 30 });
      const cb = vi.fn();
      subscribeGlobalState<{ name: string; age: number }>('u', cb);

      setGlobalState('u', { age: 31 });

      expect(cb).toHaveBeenCalledTimes(1);
      const [next, prev] = cb.mock.calls[0];
      expect(prev).toEqual({ name: 'John', age: 30 });
      expect(next).toEqual({ name: 'John', age: 31 });
    });

    it('returns a no-op unsubscribe (and warns) for an unknown key', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const cb = vi.fn();
      const unsub = subscribeGlobalState('missing', cb);

      expect(typeof unsub).toBe('function');
      expect(warn).toHaveBeenCalled();
      expect(() => unsub()).not.toThrow();
      expect(cb).not.toHaveBeenCalled();

      warn.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // resetGlobalState
  // ---------------------------------------------------------------------------
  describe('resetGlobalState', () => {
    it('resets a primitive back to the initial value', () => {
      initGlobalState('c', 10);
      setGlobalState('c', 99);
      resetGlobalState('c');
      expect(getGlobalState<number>('c')).toBe(10);
    });

    it('resets an object back to the initial value (not the last merged value)', () => {
      initGlobalState('u', { name: 'John', age: 30 });
      setGlobalState('u', { age: 31 });
      resetGlobalState('u');
      expect(getGlobalState('u')).toEqual({ name: 'John', age: 30 });
    });

    it('notifies subscribers when reset changes the value', () => {
      initGlobalState('c', 10);
      setGlobalState('c', 99);
      const cb = vi.fn();
      subscribeGlobalState<number>('c', cb);

      resetGlobalState('c');
      expect(cb).toHaveBeenCalledWith(10, 99);
    });

    it('warns and no-ops for an unknown key', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => resetGlobalState('nope')).not.toThrow();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('persists reset value to storage when initialized with storage', () => {
      initGlobalState('c', 1, { storage: 'sessionStorage' });
      setGlobalState('c', 42);
      expect(JSON.parse(sessionStorage.getItem('global-state-c')!).state.value).toBe(42);

      resetGlobalState('c');
      expect(JSON.parse(sessionStorage.getItem('global-state-c')!).state.value).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // __clearAllStates__
  // ---------------------------------------------------------------------------
  describe('__clearAllStates__', () => {
    it('removes all registered states', () => {
      initGlobalState('a', 1);
      initGlobalState('b', 2);
      expect(getGlobalState('a')).toBe(1);
      expect(getGlobalState('b')).toBe(2);

      __clearAllStates__();

      expect(getGlobalState('a')).toBeUndefined();
      expect(getGlobalState('b')).toBeUndefined();
    });

    it('allows re-initialization with a new initial value after clear', () => {
      initGlobalState('a', 1);
      __clearAllStates__();
      initGlobalState('a', 100);
      expect(getGlobalState('a')).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // configureDevtools
  // ---------------------------------------------------------------------------
  describe('configureDevtools', () => {
    it('can be turned off without breaking state APIs', () => {
      configureDevtools(false);
      initGlobalState('c', 0);
      setGlobalState('c', 5);
      expect(getGlobalState<number>('c')).toBe(5);
    });

    it('can be turned back on after being disabled', () => {
      configureDevtools(false);
      initGlobalState('c', 0);
      configureDevtools(true);
      setGlobalState('c', 5);
      expect(getGlobalState<number>('c')).toBe(5);
    });
  });

  // ---------------------------------------------------------------------------
  // End-to-end non-React flow
  // ---------------------------------------------------------------------------
  describe('End-to-end (no React)', () => {
    it('supports init → subscribe → set → reset lifecycle', () => {
      initGlobalState('e2e', { count: 0, label: 'start' });

      const cb = vi.fn();
      const unsub = subscribeGlobalState<{ count: number; label: string }>(
        'e2e',
        cb
      );

      setGlobalState('e2e', { count: 1 });
      setGlobalState('e2e', { label: 'middle' });
      setGlobalState<{ count: number; label: string }>('e2e', (prev) => ({
        ...prev,
        count: prev.count + 10,
      }));

      expect(getGlobalState('e2e')).toEqual({ count: 11, label: 'middle' });
      expect(cb).toHaveBeenCalledTimes(3);

      resetGlobalState('e2e');
      expect(getGlobalState('e2e')).toEqual({ count: 0, label: 'start' });
      expect(cb).toHaveBeenCalledTimes(4);

      unsub();
      setGlobalState('e2e', { count: 999 });
      expect(cb).toHaveBeenCalledTimes(4);
    });

    it('keeps independent stores per key', () => {
      initGlobalState('a', 1);
      initGlobalState('b', 'hello');

      setGlobalState('a', 2);
      expect(getGlobalState('a')).toBe(2);
      expect(getGlobalState('b')).toBe('hello');
    });
  });
});

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { __clearAllStates__ } from '../src/index';

// Mock console.warn and console.error to avoid noise in tests
global.console.warn = vi.fn();
global.console.error = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  __clearAllStates__();
});

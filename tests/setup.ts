import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { __clearAllStates__ } from '../src/index';

// Mock console.warn to avoid noise in tests
global.console.warn = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  __clearAllStates__();
});

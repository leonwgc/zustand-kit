/**
 * @file demo/state.ts
 * Module-level state initialization for non-React demo scenarios.
 * Import this before any code that reads/writes `non-react-counter`.
 */

import { initGlobalState } from '../src/index';

initGlobalState('non-react-counter', 0);

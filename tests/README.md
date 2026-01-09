# Test Coverage Summary

This document provides an overview of the test suite for zustand-kit.

## Test Files

- **tests/useGlobalState.test.tsx** - Tests for the main `useGlobalState` hook
- **tests/useGlobalSelector.test.tsx** - Tests for the `useGlobalSelector` hook
- **tests/useGlobalSetter.test.tsx** - Tests for the `useGlobalSetter` hook
- **tests/non-react-api.test.ts** - Tests for non-React APIs

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### useGlobalState
- ✅ Basic value initialization and updates
- ✅ Functional updates
- ✅ Reset functionality
- ✅ Shared state between components
- ✅ Object state with partial updates
- ✅ Persistence (localStorage/sessionStorage)
- ✅ Different data types (number, string, boolean, array, null)
- ✅ Edge cases and rapid updates

### useGlobalSelector
- ✅ Basic field selection
- ✅ Nested field selection
- ✅ Multiple field selection
- ✅ Derived value computation
- ✅ Selective re-rendering
- ✅ Multiple independent selectors
- ✅ Complex transformations (arrays, objects)
- ✅ Error handling

### useGlobalSetter
- ✅ Getting setter function
- ✅ Direct updates
- ✅ Functional updates
- ✅ Object partial updates
- ✅ Performance characteristics (no re-renders)
- ✅ Multiple setter hooks
- ✅ Different data types
- ✅ Integration with useGlobalState

### Non-React APIs
- ✅ getGlobalState - Getting state values
- ✅ setGlobalState - Setting state values
- ✅ subscribeGlobalState - Subscribing to changes
- ✅ resetGlobalState - Resetting to initial values
- ✅ Integration between all APIs
- ✅ Synchronization with React hooks

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Writing New Tests

When adding new features, ensure tests cover:

1. Basic functionality
2. Edge cases
3. Error handling
4. Integration with existing features
5. TypeScript type safety

## Test Structure

Each test file follows this structure:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Category', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

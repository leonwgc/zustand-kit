# zustand-kit

English | [简体中文](./README.md)

A lightweight and flexible state management library for React built on top of Zustand.

## ✨ Features

- 🚀 **Simple API** - Minimal API design, easy to get started
- 🎯 **Type Safe** - Full TypeScript support
- 💾 **Persistence** - Built-in localStorage/sessionStorage support
- 🔍 **DevTools** - Automatic Redux DevTools integration in development
- ⚡ **High Performance** - Built on Zustand, excellent performance
- 🔄 **Flexible Updates** - Support partial object updates and functional updates
- 🎨 **Selector Support** - Fine-grained subscriptions with custom equality functions
- 🌐 **Non-React Support** - Standalone APIs for non-component scenarios

## 📦 Installation

```bash
npm install zustand-kit zustand
# or
yarn add zustand-kit zustand
# or
pnpm add zustand-kit zustand
```

## 🎯 Quick Start

### Basic Usage

```tsx
import { useGlobalState } from 'zustand-kit';

function Counter() {
  const [count, setCount, resetCount] = useGlobalState('counter', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
      <button onClick={resetCount}>Reset</button>
    </div>
  );
}
```

### Object State (Partial Updates Supported)

```tsx
import { useGlobalState } from 'zustand-kit';

function UserProfile() {
  const [user, setUser, resetUser] = useGlobalState('user', {
    name: 'John',
    email: 'john@example.com',
    age: 30
  });

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      {/* Partial update - only update name, keep other fields */}
      <button onClick={() => setUser({ name: 'Jane' })}>
        Change Name
      </button>
      <button onClick={resetUser}>Reset</button>
    </div>
  );
}
```

### Persisted State

```tsx
import { useGlobalState } from 'zustand-kit';

function Settings() {
  // Persist with localStorage (DevTools auto-enabled in development)
  const [settings, setSettings] = useGlobalState(
    'settings',
    { theme: 'dark', lang: 'en-US' },
    { storage: 'localStorage' }
  );

  // Persist with sessionStorage
  const [tempData, setTempData] = useGlobalState(
    'temp',
    { foo: 'bar' },
    {
      storage: 'sessionStorage',
      storageKey: 'my-app' // Custom storage key prefix
    }
  );

  return (
    <div>
      <p>Theme: {settings.theme}</p>
      <button onClick={() => setSettings({ theme: 'light' })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Redux DevTools Integration

In development mode, all global states are automatically integrated with Redux DevTools for debugging:

```tsx
import { useGlobalState } from 'zustand-kit';

// DevTools auto-enabled in development (default behavior)
const [data, setData] = useGlobalState('data', { count: 0 });

// Disable DevTools (even in development)
const [privateData, setPrivateData] = useGlobalState('private', {}, {
  enableDevtools: false
});

// Force enable DevTools in production (not recommended)
const [debugData, setDebugData] = useGlobalState('debug', {}, {
  enableDevtools: true
});
```

In Redux DevTools, each state is displayed with the name `GlobalState:{key}`.

### Selector Pattern (Performance Optimization)

```tsx
import { useGlobalSelector } from 'zustand-kit';

function UserName() {
  // Only subscribe to user.name, won't re-render when other fields change
  // Auto-detect: uses Object.is for primitive types
  const userName = useGlobalSelector('user', (state) => state.name);

  return <p>Username: {userName}</p>;
}

function UserEmail() {
  // Only subscribe to user.email
  const userEmail = useGlobalSelector('user', (state) => state.email);

  return <p>Email: {userEmail}</p>;
}

// Auto-detect: automatically uses shallow comparison for object return
function UserInfo() {
  const userInfo = useGlobalSelector(
    'user',
    (state) => ({ name: state.name, email: state.email })
    // No need to specify 'shallow', auto-detected
  );

  return (
    <div>
      <p>Name: {userInfo.name}</p>
      <p>Email: {userInfo.email}</p>
    </div>
  );
}

// Explicitly specify 'shallow' mode
function UserInfoExplicit() {
  const userInfo = useGlobalSelector(
    'user',
    (state) => ({ name: state.name, email: state.email }),
    'shallow' // Explicitly use shallow comparison
  );

  return (
    <div>
      <p>Name: {userInfo.name}</p>
      <p>Email: {userInfo.email}</p>
    </div>
  );
}
```

### Setter Only (No State Subscription)

```tsx
import { useGlobalSetter } from 'zustand-kit';

function IncrementButton() {
  // Only get setter, don't subscribe to state changes (won't re-render)
  const setCount = useGlobalSetter<number>('counter');

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Increment
    </button>
  );
}
```

## 🔧 Non-React Usage

zustand-kit provides standalone APIs that can be used outside React components:

```typescript
import {
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState
} from 'zustand-kit';

// Get state
const count = getGlobalState<number>('counter');

// Set state
setGlobalState('counter', 5);
setGlobalState('counter', prev => prev + 1);

// Subscribe to state changes
const unsubscribe = subscribeGlobalState('counter', (newValue, prevValue) => {
  console.log(`Counter changed from ${prevValue} to ${newValue}`);
});

// Unsubscribe
unsubscribe();

// Reset state
resetGlobalState('counter');
```

## 📖 API Reference

### `useGlobalState<T>(key, initialState, options?)`

Create or connect to a global state.

**Parameters:**
- `key: string` - Unique identifier for the state
- `initialState: T` - Initial state value
- `options?: UseGlobalStateOptions` - Optional configuration
  - `storage?: 'localStorage' | 'sessionStorage' | 'none'` - Persistence type (default 'none')
  - `storageKey?: string` - Storage key prefix (default 'global-state')

**Returns:** `[state, setState, resetState]`

### `useGlobalSelector<T, R>(key, selector, equalityMode?)`

Subscribe to a specific part of the state using a selector. Automatically detects return type and selects appropriate comparison mode.

**Parameters:**
- `key: string` - State key
- `selector: (state: T) => R` - Selector function
- `equalityMode?: 'shallow'` - Optional comparison mode
  - `undefined` (default): Auto-detect based on return type
    - Primitive types: uses `Object.is`
    - Objects/arrays: uses shallow comparison
  - `'shallow'`: Force shallow comparison

**Returns:** Selected value

### `useGlobalSetter<T>(key)`

Get only the setter function without subscribing to state changes.

**Parameters:**
- `key: string` - State key

**Returns:** Setter function

### `getGlobalState<T>(key)`

Get global state value (non-React environment).

### `setGlobalState<T>(key, value)`

Set global state value (non-React environment).

### `subscribeGlobalState<T>(key, callback)`

Subscribe to global state changes (non-React environment). Returns unsubscribe function.

### `resetGlobalState(key)`

Reset global state to initial value (non-React environment).

## 🎨 TypeScript Support

zustand-kit is written in TypeScript and provides full type inference:

```typescript
// Automatic type inference
const [count, setCount] = useGlobalState('counter', 0);
// count: number
// setCount: (value: number | ((prev: number) => number)) => void

// Object state supports partial updates
const [user, setUser] = useGlobalState('user', {
  name: 'John',
  age: 30
});
// user: { name: string; age: number }
// setUser: (value: Partial<{name: string; age: number}> | ((prev) => ...)) => void

// Explicit type declaration
interface User {
  name: string;
  email: string;
}
const [user, setUser] = useGlobalState<User>('user', {
  name: 'John',
  email: 'john@example.com'
});
```

## 🤝 Comparison

| Feature | zustand-kit | Zustand | Redux | Context API |
|---------|-----------|---------|-------|-------------|
| Learning Curve | ⭐️ Easy | ⭐️⭐️ Moderate | ⭐️⭐️⭐️ Complex | ⭐️⭐️ Moderate |
| Bundle Size | Tiny | Small | Large | None |
| Performance | Excellent | Excellent | Excellent | Poor |
| TypeScript | ✅ Full | ✅ Full | ✅ Full | ⚠️ Basic |
| Persistence | ✅ Built-in | ✅ Middleware | Plugin Required | ❌ |
| Selectors | ✅ | ✅ | ✅ | ❌ |
| Ease of Use | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ | ⭐️⭐️ | ⭐️⭐️⭐️ |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test Coverage: 93%+ (statements, branches, functions)

## 📄 License

MIT

## 🔗 Links

- [GitHub](https://github.com/leonwgc/zustand-kit)
- [Issues](https://github.com/leonwgc/zustand-kit/issues)
- [Zustand](https://github.com/pmndrs/zustand)

## 👨‍💻 Author

leon.wang

---

If this project helps you, please give it a ⭐️!

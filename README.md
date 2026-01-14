# zustand-kit

[English](./README_EN.md) | 简体中文

一个基于 Zustand 构建的轻量级、灵活的 React 状态管理库。

## ✨ 特性

- 🚀 **简单易用** - 最小化的 API 设计，易于上手
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 💾 **持久化** - 内置 localStorage/sessionStorage 支持
- 🔍 **开发者工具** - 开发环境自动集成 Redux DevTools
- ⚡ **高性能** - 基于 Zustand，性能卓越
- 🔄 **灵活更新** - 支持对象部分更新和函数式更新
- 🎨 **智能选择器** - 细粒度订阅，自动检测返回值类型并优化性能
- 🌐 **非 React 环境支持** - 提供独立的 API 用于非组件场景

## 📦 安装

```bash
npm install zustand-kit zustand
# 或
yarn add zustand-kit zustand
# 或
pnpm add zustand-kit zustand
```

## 🎯 快速开始

### 基础用法

```tsx
import { useGlobalState } from 'zustand-kit';

function Counter() {
  const [count, setCount, resetCount] = useGlobalState('counter', 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(prev => prev - 1)}>减少</button>
      <button onClick={resetCount}>重置</button>
    </div>
  );
}
```

### 对象状态（支持部分更新）

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
      <p>名称: {user.name}</p>
      <p>邮箱: {user.email}</p>
      {/* 部分更新 - 只更新 name，其他字段保持不变 */}
      <button onClick={() => setUser({ name: 'Jane' })}>
        更改名称
      </button>
      <button onClick={resetUser}>重置</button>
    </div>
  );
}
```

### 持久化状态

```tsx
import { useGlobalState } from 'zustand-kit';

function Settings() {
  // 使用 localStorage 持久化（开发环境自动启用 DevTools）
  const [settings, setSettings] = useGlobalState(
    'settings',
    { theme: 'dark', lang: 'zh-CN' },
    { storage: 'localStorage' }
  );

  // 使用 sessionStorage 持久化
  const [tempData, setTempData] = useGlobalState(
    'temp',
    { foo: 'bar' },
    {
      storage: 'sessionStorage',
      storageKey: 'my-app' // 自定义存储键前缀
    }
  );

  return (
    <div>
      <p>主题: {settings.theme}</p>
      <button onClick={() => setSettings({ theme: 'light' })}>
        切换主题
      </button>
    </div>
  );
}
```

### Redux DevTools 集成

在开发环境下，所有全局状态会自动集成到统一的 Redux DevTools 视图中，便于调试：

```tsx
import { useGlobalState } from 'zustand-kit';

// 开发环境自动启用 DevTools（默认行为）
const [data, setData] = useGlobalState('data', { count: 0 });

// 禁用 DevTools（即使在开发环境）
const [privateData, setPrivateData] = useGlobalState('private', {}, {
  enableDevtools: false
});

// 强制启用 DevTools（生产环境，不推荐）
const [debugData, setDebugData] = useGlobalState('debug', {}, {
  enableDevtools: true
});
```

**注意：** 所有全局状态会聚合到一个名为 `GlobalStates (All)` 的 DevTools 实例中，每个状态以其 key 作为属性显示，方便统一查看和调试所有状态。

### 选择器模式（性能优化）

```tsx
import { useGlobalSelector } from 'zustand-kit';

function UserName() {
  // 仅订阅 user.name，其他字段变化不会触发重渲染
  // 自动检测：基本类型使用 Object.is
  const userName = useGlobalSelector('user', (state) => state.name);

  return <p>用户名: {userName}</p>;
}

function UserEmail() {
  // 仅订阅 user.email
  const userEmail = useGlobalSelector('user', (state) => state.email);

  return <p>邮箱: {userEmail}</p>;
}

// 自动检测：对象返回值自动使用浅比较
function UserInfo() {
  const userInfo = useGlobalSelector(
    'user',
    (state) => ({ name: state.name, email: state.email })
    // 无需指定 'shallow'，自动检测对象类型并使用浅比较
  );

  return (
    <div>
      <p>姓名: {userInfo.name}</p>
      <p>邮箱: {userInfo.email}</p>
    </div>
  );
}

// 显式指定 'shallow' 模式
function UserInfoExplicit() {
  const userInfo = useGlobalSelector(
    'user',
    (state) => ({ name: state.name, email: state.email }),
    'shallow' // 显式指定浅比较
  );

  return (
    <div>
      <p>姓名: {userInfo.name}</p>
      <p>邮箱: {userInfo.email}</p>
    </div>
  );
}
```

### 仅获取 Setter（不订阅状态）

```tsx
import { useGlobalSetter } from 'zustand-kit';

function IncrementButton() {
  // 只获取 setter，不订阅状态变化（不会重渲染）
  const setCount = useGlobalSetter<number>('counter');

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      增加
    </button>
  );
}
```

## 🔧 非 React 环境使用

zustand-kit 提供了独立的 API，可以在非 React 组件中使用：

```typescript
import {
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState
} from 'zustand-kit';

// 获取状态
const count = getGlobalState<number>('counter');

// 设置状态
setGlobalState('counter', 5);
setGlobalState('counter', prev => prev + 1);

// 订阅状态变化
const unsubscribe = subscribeGlobalState('counter', (newValue, prevValue) => {
  console.log(`Counter 从 ${prevValue} 变为 ${newValue}`);
});

// 取消订阅
unsubscribe();

// 重置状态
resetGlobalState('counter');
```

## 📖 API 参考

### `useGlobalState<T>(key, initialState, options?)`

创建或连接到全局状态。

**参数：**
- `key: string` - 状态的唯一标识符
- `initialState: T` - 初始状态值
- `options?: UseGlobalStateOptions` - 可选配置
  - `storage?: 'localStorage' | 'sessionStorage' | 'none'` - 持久化类型（默认 'none'）
  - `storageKey?: string` - 存储键前缀（默认 'global-state'）
  - `enableDevtools?: boolean` - 是否启用 Redux DevTools（开发环境默认 true，生产环境默认 false）

**返回：** `[state, setState, resetState]`

**注意：** 对于对象类型的状态，`setState` 支持部分更新。例如：`setUser({ name: 'Jane' })` 只会更新 `name` 字段，其他字段保持不变。

### `useGlobalSelector<T, R>(key, selector, equalityMode?)`

使用选择器订阅状态的特定部分。支持自动检测返回值类型并选择合适的比较模式。

**参数：**
- `key: string` - 状态键
- `selector: (state: T) => R` - 选择器函数
- `equalityMode?: 'shallow' | false` - 可选的比较模式
  - `undefined` (默认)：自动检测返回值类型
    - 基本类型：使用 `Object.is`
    - 对象/数组：使用浅比较
  - `'shallow'`：强制使用浅比较
  - `false`：强制使用 `Object.is` 比较（即使对象类型）

**返回：** 选择的值

### `useGlobalSetter<T>(key)`

仅获取 setter 函数，不订阅状态变化。

**参数：**
- `key: string` - 状态键

**返回：** setter 函数

### `getGlobalState<T>(key)`

获取全局状态值（非 React 环境）。

### `setGlobalState<T>(key, value)`

设置全局状态值（非 React 环境）。

### `subscribeGlobalState<T>(key, callback)`

订阅全局状态变化（非 React 环境）。返回取消订阅函数。

### `resetGlobalState(key)`

重置全局状态为初始值（非 React 环境）。

## 🎨 TypeScript 支持

zustand-kit 使用 TypeScript 编写，提供完整的类型推断：

```typescript
// 自动推断类型
const [count, setCount] = useGlobalState('counter', 0);
// count: number
// setCount: (value: number | ((prev: number) => number)) => void

// 对象状态支持部分更新
const [user, setUser] = useGlobalState('user', {
  name: 'John',
  age: 30
});
// user: { name: string; age: number }
// setUser: (value: Partial<{name: string; age: number}> | ((prev) => ...)) => void

// 显式类型声明
interface User {
  name: string;
  email: string;
}
const [user, setUser] = useGlobalState<User>('user', {
  name: 'John',
  email: 'john@example.com'
});
```

## 🤝 对比其他方案

| 特性 | zustand-kit | Zustand | Redux | Context API |
|------|-----------|---------|-------|-------------|
| 学习曲线 | ⭐️ 简单 | ⭐️⭐️ 较简单 | ⭐️⭐️⭐️ 复杂 | ⭐️⭐️ 中等 |
| 包体积 | 极小 | 小 | 大 | 无 |
| 性能 | 优秀 | 优秀 | 优秀 | 较差 |
| TypeScript | ✅ 完整 | ✅ 完整 | ✅ 完整 | ⚠️ 基础 |
| 持久化 | ✅ 内置 | ✅ 中间件 | 需要插件 | ❌ |
| 选择器 | ✅ | ✅ | ✅ | ❌ |
| 易用性 | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ | ⭐️⭐️ | ⭐️⭐️⭐️ |

## 🧪 测试

```bash
# 运行测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

测试覆盖率：93%+ （语句、分支、函数覆盖率）

## 📄 许可证

MIT

## 🔗 链接

- [GitHub](https://github.com/leonwgc/zustand-kit)
- [Issues](https://github.com/leonwgc/zustand-kit/issues)
- [Zustand](https://github.com/pmndrs/zustand)

## 👨‍💻 作者

leon.wang

---

如果这个项目对你有帮助，欢迎给个 ⭐️！

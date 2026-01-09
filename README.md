# zustand-x

[English](./README_EN.md) | 简体中文

一个基于 Zustand 构建的轻量级、灵活的 React 状态管理库。

## ✨ 特性

- 🚀 **简单易用** - 最小化的 API 设计，易于上手
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 💾 **持久化** - 内置 localStorage/sessionStorage 支持
- ⚡ **高性能** - 基于 Zustand，性能卓越
- 🔄 **灵活更新** - 支持对象部分更新和函数式更新
- 🎨 **选择器支持** - 细粒度订阅，避免不必要的重渲染
- 🌐 **非 React 环境支持** - 提供独立的 API 用于非组件场景

## 📦 安装

```bash
npm install zustand-x zustand
# 或
yarn add zustand-x zustand
# 或
pnpm add zustand-x zustand
```

## 🎯 快速开始

### 基础用法

```tsx
import { useGlobalState } from 'zustand-x';

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
import { useGlobalState } from 'zustand-x';

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
import { useGlobalState } from 'zustand-x';

function Settings() {
  // 使用 localStorage 持久化
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

### 选择器模式（性能优化）

```tsx
import { useGlobalSelector } from 'zustand-x';

function UserName() {
  // 仅订阅 user.name，其他字段变化不会触发重渲染
  const userName = useGlobalSelector('user', (state) => state.name);

  return <p>用户名: {userName}</p>;
}

function UserEmail() {
  // 仅订阅 user.email
  const userEmail = useGlobalSelector('user', (state) => state.email);

  return <p>邮箱: {userEmail}</p>;
}
```

### 仅获取 Setter（不订阅状态）

```tsx
import { useGlobalSetter } from 'zustand-x';

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

zustand-x 提供了独立的 API，可以在非 React 组件中使用：

```typescript
import {
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState
} from 'zustand-x';

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

**返回：** `[state, setState, resetState]`

### `useGlobalSelector<T, R>(key, selector)`

使用选择器订阅状态的特定部分。

**参数：**
- `key: string` - 状态键
- `selector: (state: T) => R` - 选择器函数

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

zustand-x 使用 TypeScript 编写，提供完整的类型推断：

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

| 特性 | zustand-x | Zustand | Redux | Context API |
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

- [GitHub](https://github.com/leonwgc/zustand-x)
- [Issues](https://github.com/leonwgc/zustand-x/issues)
- [Zustand](https://github.com/pmndrs/zustand)

## 👨‍💻 作者

leon.wang

---

如果这个项目对你有帮助，欢迎给个 ⭐️！

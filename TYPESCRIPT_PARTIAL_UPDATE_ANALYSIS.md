# TypeScript Partial Update 问题分析

## 问题描述

使用 partial update 时，TypeScript 会抛出类型错误：

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

const [user, setUser] = useGlobalState('user', { name: 'John', email: 'john@example.com', age: 30 });

// ❌ 之前会报错：类型 "{ name: string; }" 不能赋值给类型 "Partial<User> | ((prev: User) => User)"
setUser({ name: 'Jane' });
```

## 根本原因

### 1. TypeScript 类型推断机制

当你写 `{ name: 'Jane' }` 时：
- TypeScript 将其推断为精确的对象字面量类型：`{ name: string }`
- **不会**自动推断为 `Partial<User>`

### 2. 原始类型定义的问题

```typescript
// 原始定义（有问题）
type SetterValue<T> = T extends Record<string, unknown>
  ? Partial<T> | ((prev: T) => T)
  : T | ((prev: T) => T);
```

对于 `User` 类型：
- `SetterValue<User>` = `Partial<User> | ((prev: User) => User)`
- `Partial<User>` = `{ name?: string; email?: string; age?: number }`
- `{ name: string }` ≠ `Partial<User>`（虽然结构兼容，但类型不同）

### 3. 为什么结构兼容还会报错？

```typescript
// 这两个类型结构兼容但不相同
type A = { name: string };                      // 只有 name 属性
type B = { name?: string; email?: string };     // 有 name 和 email 属性（都是可选）

// TypeScript 严格模式下：A 不能直接赋值给 B
// 因为它们的"形状"（shape）不同
```

## 解决方案

### 采用的方案：简化类型定义

```typescript
// 改进后的定义（已实施）
type SetterValue<T> = T | Partial<T> | ((prev: T) => T);
```

### 为什么这样可以？

1. **联合类型的工作方式**
   - 当传入 `{ name: 'Jane' }` 时，TypeScript 可以匹配到 `Partial<User>` 分支
   - `{ name: string }` 可以安全地赋值给 `Partial<User>`

2. **对基本类型无影响**
   ```typescript
   // 对于基本类型
   SetterValue<number> = number | Partial<number> | ((prev: number) => number)

   // 由于 Partial<number> 等同于 number（基本类型没有属性）
   // 实际上等同于 number | ((prev: number) => number)
   ```

3. **更符合直觉**
   - 不需要类型断言
   - 支持完整对象、部分对象、函数更新

## 使用示例

### ✅ 现在可以直接使用（无需断言）

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

const [user, setUser] = useGlobalState('user', {
  name: 'John',
  email: 'john@example.com',
  age: 30
});

// ✅ 部分更新 - 直接使用
setUser({ name: 'Jane' });

// ✅ 多字段部分更新
setUser({ name: 'Jane', age: 31 });

// ✅ 完整对象
setUser({ name: 'Jane', email: 'jane@example.com', age: 31 });

// ✅ 函数式更新
setUser(prev => ({ ...prev, age: prev.age + 1 }));

// ✅ 基本类型也正常工作
const [count, setCount] = useGlobalState('count', 0);
setCount(5);
setCount(prev => prev + 1);
```

## 技术对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| 条件类型（旧） | 类型精确，区分对象和基本类型 | 需要类型断言，不便使用 |
| 联合类型（新）| 无需断言，符合直觉，易用 | 对基本类型有冗余类型（不影响使用） |

## 总结

通过简化类型定义为 `T | Partial<T> | ((prev: T) => T)`：

1. **解决了 TypeScript 类型推断问题**
2. **提供了更好的开发体验**（无需类型断言）
3. **保持了类型安全**
4. **对现有代码100%兼容**

这是一个工程实践中的权衡：牺牲一点类型定义的"完美主义"，换取更好的易用性和开发体验。

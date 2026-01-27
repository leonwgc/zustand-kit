// TypeScript 类型推断问题演示

interface User {
  name: string;
  email: string;
  age: number;
}

// 当前的 SetterValue 类型定义
type SetterValue<T> = T extends Record<string, unknown>
  ? Partial<T> | ((prev: T) => T)
  : T | ((prev: T) => T);

// 模拟 setter 函数
declare function setUser(value: SetterValue<User>): void;

// ❌ TypeScript 报错：类型 "{ name: string; }" 不能赋值给类型 "Partial<User> | ((prev: User) => User)"
// 因为 { name: string } 被推断为字面量类型，不等同于 Partial<User>
// setUser({ name: 'Jane' });

// ✅ 使用类型断言可以工作
setUser({ name: 'Jane' } as Partial<User>);

// ✅ 函数更新可以工作
setUser(prev => ({ ...prev, name: 'Jane' }));

// ✅ 完整对象可以工作
setUser({ name: 'Jane', email: 'jane@example.com', age: 30 });

/**
 * 解决方案分析：
 *
 * 1. 保持当前设计，要求用户使用类型断言（当前方案）
 *    优点：类型安全，不会误接受错误的属性
 *    缺点：使用不便，需要手动断言
 *
 * 2. 改进类型定义，使用更宽松的类型
 *    type SetterValue<T> = T | Partial<T> | ((prev: T) => T);
 *    优点：使用方便，不需要断言
 *    缺点：对于非对象类型会有额外的 Partial<T>（但实际运行时不受影响）
 *
 * 3. 使用函数重载
 *    优点：可以提供更精确的类型提示
 *    缺点：实现复杂，维护成本高
 */

// 方案2的改进类型
type ImprovedSetterValue<T> = T | Partial<T> | ((prev: T) => T);

declare function setUserImproved(value: ImprovedSetterValue<User>): void;

// ✅ 现在可以直接使用，无需断言
setUserImproved({ name: 'Jane' });
setUserImproved({ age: 31 });
setUserImproved(prev => ({ ...prev, name: 'Jane' }));
setUserImproved({ name: 'Jane', email: 'jane@example.com', age: 30 });

// 对于基本类型也能正常工作
declare function setCount(value: ImprovedSetterValue<number>): void;
setCount(5);
setCount(prev => prev + 1);
// Partial<number> 等同于 number，所以不会有问题

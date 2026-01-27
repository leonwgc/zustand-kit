/**
 * 验证改进后的 SetterValue 类型定义
 *
 * 运行此文件检查 TypeScript 类型检查：
 * npx tsc --noEmit type-validation.ts
 */

// 模拟改进后的类型定义
type SetterValue<T> = T | Partial<T> | ((prev: T) => T);

interface User {
  name: string;
  email: string;
  age: number;
}

// 模拟 setter 函数
declare function setUser(value: SetterValue<User>): void;
declare function setCount(value: SetterValue<number>): void;

// ====== 测试对象类型 ======

// ✅ 部分更新 - 单个字段（最常用场景）
setUser({ name: 'Jane' });

// ✅ 部分更新 - 多个字段
setUser({ name: 'Jane', age: 31 });

// ✅ 完整对象更新
setUser({ name: 'Jane', email: 'jane@example.com', age: 31 });

// ✅ 函数式更新
setUser(prev => ({ ...prev, age: prev.age + 1 }));

// ✅ 函数式更新 - 部分返回（需要展开）
setUser(prev => ({ ...prev, name: 'Updated' }));

// ❌ TypeScript 会正确报错：不存在的属性
// setUser({ unknown: 'field' });

// ❌ TypeScript 会正确报错：类型不匹配
// setUser({ age: 'not a number' });

// ====== 测试基本类型 ======

// ✅ 直接设置值
setCount(5);

// ✅ 函数式更新
setCount(prev => prev + 1);

// ❌ TypeScript 会正确报错：类型不匹配
// setCount('not a number');

// ====== 测试数组类型 ======

declare function setItems(value: SetterValue<string[]>): void;

// ✅ 直接设置
setItems(['a', 'b', 'c']);

// ✅ 函数式更新
setItems(prev => [...prev, 'new']);

// ✅ Partial<string[]> 对数组来说就是 string[]
setItems([]);

console.log('✅ All type checks passed!');
console.log('如果没有 TypeScript 错误，说明类型定义正确！');

export { };

/**
 * @file demo/Example.tsx
 * @author leon.wang
 *
 * Layout-only entry — every demo widget lives in ./components/.
 */

import React, { useState } from 'react';
import {
  Space,
  Typography,
  Divider,
  Collapse,
  ConfigProvider,
} from 'antd';
import './state';
import {
  CounterComponentA,
  CounterComponentB,
  UserComponentA,
  UserComponentB,
  ProductList,
  ShoppingCart,
  UserNameDisplay,
  CounterButtons,
  PersistentSettings,
  SessionData,
  NonReactUsageExample,
  NonReactStateDisplay,
  UserSelectorWithEqualityFn,
  UserSelectorExplicitShallow,
  UserSelectorObjectIs,
  DerivedSelector,
  DevToolsExample,
} from './components';
import './Example.scss';

const { Title, Paragraph, Text } = Typography;

const codeBlockStyle: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 16,
  borderRadius: 4,
  fontSize: 12,
  margin: 0,
  overflow: 'auto',
};

const Example: React.FC = () => {
  const [showOptimized] = useState(true);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00131c' } }}>
      <div className="use-global-state-example">
        <Title level={2}>基于 Zustand 的全局状态共享</Title>

        <Title level={3}>1. Simple Value - useGlobalState</Title>
        <Paragraph>
          <Text code>
            const [count, setCount, resetCount] = useGlobalState(&apos;counter&apos;, 0)
          </Text>{' '}
          - 适用于简单值类型
        </Paragraph>
        <div className="use-global-state-example__row">
          <CounterComponentA />
          <CounterComponentB />
          {showOptimized && <CounterButtons />}
        </div>
        <Collapse
          items={[
            {
              key: '1',
              label: '查看代码示例',
              children: (
                <pre style={codeBlockStyle}>
                  {`const [count, setCount, resetCount] = useGlobalState('counter', 0);

// 直接赋值
setCount(5);

// 函数式更新
setCount(prev => prev + 1);

// 重置到初始值
resetCount();`}
                </pre>
              ),
            },
          ]}
          style={{ marginTop: 16 }}
        />

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>2. Object State - useGlobalState</Title>
        <Paragraph>
          <Text code>
            const [user, setUser, resetUser] = useGlobalState(&apos;user&apos;, {'{ }'})
          </Text>{' '}
          - 支持对象类型和部分更新
        </Paragraph>
        <div className="use-global-state-example__row">
          <UserComponentA />
          <UserComponentB />
        </div>
        <Collapse
          items={[
            {
              key: '1',
              label: '查看代码示例',
              children: (
                <pre style={codeBlockStyle}>
                  {`const [user, setUser, resetUser] = useGlobalState('user', {
  name: 'John',
  email: 'john@example.com',
  age: 30
});

// 部分更新 - 只更新 name 字段
setUser({ name: 'Jane' });

// 函数式更新
setUser(prev => ({ ...prev, age: prev.age + 1 }));

// 重置到初始值
resetUser();`}
                </pre>
              ),
            },
          ]}
          style={{ marginTop: 16 }}
        />

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>3. Performance Optimization</Title>
        <Paragraph>
          <Text strong>优化重渲染：</Text>使用{' '}
          <Text code>useGlobalSelector</Text> 和 <Text code>useGlobalSetter</Text>{' '}
          减少不必要的组件重渲染，支持浅比较优化
        </Paragraph>
        <Space style={{ marginBottom: 16 }}>
          <Text type="secondary">
            观察 Render Count - 优化组件不会因为无关状态变化而重渲染
          </Text>
        </Space>
        {showOptimized && (
          <div className="use-global-state-example__row">
            <UserNameDisplay />
            <CounterButtons />
            <UserSelectorWithEqualityFn />
            <UserSelectorExplicitShallow />
            <UserSelectorObjectIs />
            <DerivedSelector />
          </div>
        )}
        {showOptimized && (
          <Collapse
            items={[
              {
                key: '1',
                label: '查看代码示例',
                children: (
                  <pre style={codeBlockStyle}>
                    {`// useGlobalSelector - 细粒度订阅（基本类型自动使用 Object.is）
const userName = useGlobalSelector('user', state => state.name);

// 自动浅比较 - 对象返回值自动使用 useShallow
const userInfo = useGlobalSelector('user', state => ({
  name: state.name,
  email: state.email
}));

// 显式浅比较（意图更明确）
const userInfo2 = useGlobalSelector(
  'user',
  state => ({ name: state.name, email: state.email }),
  'shallow'
);

// 强制 Object.is —— 用于基本类型 / 稳定引用
const age = useGlobalSelector('user', state => state.age, false);

// 派生 / 计算选择器 —— 只在结果变化时重渲染
const isAdult = useGlobalSelector('user', state => state.age >= 18);

// useGlobalSetter - 只写模式，不订阅状态
const setCount = useGlobalSetter<number>('counter');
setCount(prev => prev + 1);`}
                  </pre>
                ),
              },
            ]}
            style={{ marginTop: 16 }}
          />
        )}

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>4. Redux DevTools Integration</Title>
        <Paragraph>
          <Text strong>开发者工具：</Text>开发环境自动集成 Redux
          DevTools，支持时间旅行调试
        </Paragraph>
        <div className="use-global-state-example__row">
          <DevToolsExample />
        </div>
        <Collapse
          items={[
            {
              key: '1',
              label: '查看代码示例',
              children: (
                <pre style={codeBlockStyle}>
                  {`// 开发环境自动启用 DevTools（默认）
const [data, setData] = useGlobalState('data', { count: 0 });

// 在应用入口全局禁用 DevTools
import { configureDevtools } from 'zustand-kit';
configureDevtools(false);

// 在应用入口全局启用 DevTools（如需在生产环境调试）
configureDevtools(true);

// 在 Redux DevTools 中显示为: GlobalStates (All)`}
                </pre>
              ),
            },
          ]}
          style={{ marginTop: 16 }}
        />

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>
          5. Persistent State - localStorage & sessionStorage
        </Title>
        <Paragraph>
          <Text strong>数据持久化：</Text>使用 <Text code>storage</Text>{' '}
          选项实现跨页面刷新的状态保存
        </Paragraph>
        <div className="use-global-state-example__row">
          <PersistentSettings />
          <SessionData />
        </div>
        <Collapse
          items={[
            {
              key: '1',
              label: '查看代码示例',
              children: (
                <pre style={codeBlockStyle}>
                  {`// localStorage - 持久化存储
const [settings, setSettings] = useGlobalState(
  'settings',
  { theme: 'dark', lang: 'en' },
  { storage: 'localStorage', storageKey: 'my-app' }
);

// sessionStorage - 会话存储
const [tempData, setTempData] = useGlobalState(
  'temp',
  { count: 0 },
  { storage: 'sessionStorage' }
);

// 状态会自动保存到 storage，刷新页面后自动恢复`}
                </pre>
              ),
            },
          ]}
          style={{ marginTop: 16 }}
        />

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>6. Shopping Cart Example</Title>
        <Paragraph>
          实际场景示例：购物车状态在商品列表和购物车组件间共享
        </Paragraph>
        <div className="use-global-state-example__row">
          <ProductList />
          <ShoppingCart />
        </div>
        <Collapse
          items={[
            {
              key: '1',
              label: '查看代码示例',
              children: (
                <pre style={codeBlockStyle}>
                  {`const [cart, setCart] = useGlobalState<CartItem[]>('cart', []);

// 添加商品到购物车
const addToCart = (product: Product) => {
  setCart(prev => {
    const existing = prev.find(item => item.id === product.id);
    if (existing) {
      return prev.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
};

// 多个组件共享购物车状态`}
                </pre>
              ),
            },
          ]}
          style={{ marginTop: 16 }}
        />

        <Divider style={{ margin: '32px 0' }} />

        <Title level={3}>7. Non-React Usage - Pure JavaScript/TypeScript</Title>
        <Paragraph>
          <Text strong>在非 React 代码中使用：</Text>
          工具函数、服务类、事件监听器、定时器等场景
        </Paragraph>
        <div className="use-global-state-example__row">
          <NonReactUsageExample />
          <NonReactStateDisplay />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Example;

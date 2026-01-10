/**
 * @file src/pages/Hooks/Example.tsx
 * @author leon.wang
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Input, Typography, Divider, Badge, Collapse } from 'antd';
import {
  useGlobalState,
  useGlobalSelector,
  useGlobalSetter,
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState,
} from '../src/index';
import './Example.scss';

const { Title, Paragraph, Text } = Typography;

// Example 1: Simple counter shared between components
const CounterComponentA: React.FC = () => {
  const [count, setCount] = useGlobalState('counter', 0);

  return (
    <Card
      title="Component A - Simple Value"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          Current Count:{' '}
          <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
            {count}
          </Text>
        </Text>
        <Space>
          <Button type="primary" onClick={() => setCount(count + 1)}>
            Increment
          </Button>
          <Button onClick={() => setCount(count - 1)}>Decrement</Button>
          <Button onClick={() => setCount(0)}>Reset to 0</Button>
        </Space>
      </Space>
    </Card>
  );
};

const CounterComponentB: React.FC = () => {
  const [count, setCount] = useGlobalState('counter', 0);

  return (
    <Card
      title="Component B - Shared State"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          Same Count:{' '}
          <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
            {count}
          </Text>
        </Text>
        <Space>
          <Button type="primary" onClick={() => setCount((prev) => prev + 5)}>
            +5
          </Button>
          <Button onClick={() => setCount((prev) => prev * 2)}>×2</Button>
        </Space>
      </Space>
    </Card>
  );
};

// Example 2: Object state shared between components
const UserComponentA: React.FC = () => {
  const [user, setUser] = useGlobalState('user', {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
  });

  return (
    <Card
      title="Component A - User Profile"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Name:</Text> {user.name}
        </div>
        <div>
          <Text strong>Email:</Text> {user.email}
        </div>
        <div>
          <Text strong>Age:</Text> {user.age}
        </div>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Name"
            value={user.name}
            onChange={(e) => setUser({ name: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ email: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Age"
            value={user.age}
            onChange={(e) => setUser({ age: Number(e.target.value) })}
          />
        </Space>
      </Space>
    </Card>
  );
};

const UserComponentB: React.FC = () => {
  const [user, setUser, resetUser] = useGlobalState('user', {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
  });

  return (
    <Card
      title="Component B - Display & Actions"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="use-global-state-example__profile">
          <div className="use-global-state-example__avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div>
              <Text strong style={{ fontSize: 18 }}>
                {user.name}
              </Text>
            </div>
            <div>
              <Text type="secondary">{user.email}</Text>
            </div>
            <div>
              <Text>Age: {user.age}</Text>
            </div>
          </div>
        </div>
        <Divider />
        <Space>
          <Button type="primary" onClick={() => setUser({ age: user.age + 1 })}>
            Birthday 🎂
          </Button>
          <Button onClick={resetUser}>Reset Profile</Button>
        </Space>
      </Space>
    </Card>
  );
};

// Example 3: Shopping cart
const ProductList: React.FC = () => {
  const [cart, setCart] = useGlobalState('cart', {
    items: [] as Array<{ id: number; name: string; price: number }>,
    total: 0,
  });

  const products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 },
    { id: 3, name: 'Keyboard', price: 79 },
    { id: 4, name: 'Monitor', price: 299 },
  ];

  const addToCart = (product: (typeof products)[0]) => {
    setCart({
      items: [...cart.items, product],
      total: cart.total + product.price,
    });
  };

  return (
    <Card title="Product List" className="use-global-state-example__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {products.map((product) => (
          <div key={product.id} className="use-global-state-example__product">
            <div>
              <Text strong>{product.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ${product.price}
              </Text>
            </div>
            <Button
              size="small"
              type="primary"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </Button>
          </div>
        ))}
      </Space>
    </Card>
  );
};

const ShoppingCart: React.FC = () => {
  const [cart, setCart, resetCart] = useGlobalState('cart', {
    items: [] as Array<{ id: number; name: string; price: number }>,
    total: 0,
  });

  const removeItem = (index: number) => {
    const newItems = [...cart.items];
    const removedItem = newItems.splice(index, 1)[0];
    setCart({
      items: newItems,
      total: cart.total - removedItem.price,
    });
  };

  return (
    <Card title="Shopping Cart" className="use-global-state-example__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {cart.items.length === 0 ? (
          <Text type="secondary">Cart is empty</Text>
        ) : (
          <>
            {cart.items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="use-global-state-example__cart-item"
              >
                <div>
                  <Text>{item.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ${item.price}
                  </Text>
                </div>
                <Button size="small" danger onClick={() => removeItem(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Divider />
            <div className="use-global-state-example__total">
              <Text strong>Total:</Text>
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                ${cart.total}
              </Text>
            </div>
            <Button block onClick={resetCart}>
              Clear Cart
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
};

// Example 4: Performance optimization with useGlobalSelector
let renderCountSelector = 0;
const UserNameDisplay: React.FC = () => {
  renderCountSelector++;
  // Only subscribes to name field, won't re-render when email or age changes
  const userName = useGlobalSelector<
    { name: string; email: string; age: number },
    string
  >('user', (state) => state.name);

  return (
    <Card
      title="Component C - Optimized Selector"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge
          count={renderCountSelector}
          style={{ backgroundColor: '#52c41a' }}
        >
          <Text strong>Render Count</Text>
        </Badge>
        <div style={{ marginTop: 12 }}>
          <Text>User Name (selector): </Text>
          <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
            {userName}
          </Text>
        </div>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 This component only subscribes to the "name" field.
          <br />
          Try changing email or age in Component A - this won't re-render!
        </Text>
      </Space>
    </Card>
  );
};

// Example 5: Performance optimization with useGlobalSetter
let renderCountSetter = 0;
const CounterButtons: React.FC = () => {
  renderCountSetter++;
  // Only gets setter, doesn't subscribe to count changes - won't re-render
  const setCount = useGlobalSetter<number>('counter');

  return (
    <Card
      title="Component C - Setter Only"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCountSetter} style={{ backgroundColor: '#52c41a' }}>
          <Text strong>Render Count</Text>
        </Badge>
        <Space style={{ marginTop: 12 }}>
          <Button
            type="primary"
            onClick={() => setCount((prev) => (prev as number) + 10)}
          >
            +10
          </Button>
          <Button onClick={() => setCount((prev) => (prev as number) * 3)}>
            ×3
          </Button>
          <Button danger onClick={() => setCount(0)}>
            Reset
          </Button>
        </Space>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 This component only updates state, doesn't read it.
          <br />
          Check Component A/B - it won't re-render when count changes!
        </Text>
      </Space>
    </Card>
  );
};

// Example 6: Persistent state with localStorage
const PersistentSettings: React.FC = () => {
  const [settings, setSettings] = useGlobalState(
    'app-settings',
    {
      theme: 'light' as 'light' | 'dark',
      language: 'en' as 'en' | 'zh',
      notifications: true,
    },
    { storage: 'localStorage', storageKey: 'demo-app' }
  );

  return (
    <Card
      title="Persistent Settings (localStorage)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🔄 These settings persist across page refreshes
        </Text>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Theme: </Text>
            <Space>
              <Button
                type={settings.theme === 'light' ? 'primary' : undefined}
                onClick={() => setSettings({ theme: 'light' })}
              >
                Light
              </Button>
              <Button
                type={settings.theme === 'dark' ? 'primary' : undefined}
                onClick={() => setSettings({ theme: 'dark' })}
              >
                Dark
              </Button>
            </Space>
          </div>
          <div>
            <Text strong>Language: </Text>
            <Space>
              <Button
                type={settings.language === 'en' ? 'primary' : undefined}
                onClick={() => setSettings({ language: 'en' })}
              >
                English
              </Button>
              <Button
                type={settings.language === 'zh' ? 'primary' : undefined}
                onClick={() => setSettings({ language: 'zh' })}
              >
                中文
              </Button>
            </Space>
          </div>
          <div>
            <Text strong>Notifications: </Text>
            <Button
              type={settings.notifications ? 'primary' : undefined}
              onClick={() =>
                setSettings({ notifications: !settings.notifications })
              }
            >
              {settings.notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </Space>
        <Divider />
        <Text strong>Current Settings:</Text>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </Space>
    </Card>
  );
};

// Example 7: Session-only state with sessionStorage
const SessionData: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useGlobalState(
    'session-info',
    {
      visitCount: 0,
      lastVisit: new Date().toISOString(),
      tabId: Math.random().toString(36).substring(7),
    },
    { storage: 'sessionStorage' }
  );

  return (
    <Card
      title="Session Data (sessionStorage)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🕐 This data persists only during the browser session
        </Text>
        <Divider />
        <div>
          <Text strong>Visit Count: </Text>
          <Text style={{ fontSize: 18, color: '#1890ff' }}>
            {sessionInfo.visitCount}
          </Text>
        </div>
        <div>
          <Text strong>Tab ID: </Text>
          <Text code>{sessionInfo.tabId}</Text>
        </div>
        <div>
          <Text strong>Last Visit: </Text>
          <Text type="secondary">
            {new Date(sessionInfo.lastVisit).toLocaleString()}
          </Text>
        </div>
        <Space style={{ marginTop: 12 }}>
          <Button
            type="primary"
            onClick={() =>
              setSessionInfo({
                visitCount: sessionInfo.visitCount + 1,
                lastVisit: new Date().toISOString(),
              })
            }
          >
            Record Visit
          </Button>
          <Button
            onClick={() =>
              setSessionInfo({
                visitCount: 0,
                lastVisit: new Date().toISOString(),
                tabId: Math.random().toString(36).substring(7),
              })
            }
          >
            Reset Session
          </Button>
        </Space>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Try refreshing the page - data persists!
          <br />
          Close the tab and reopen - data will be reset.
        </Text>
      </Space>
    </Card>
  );
};

// Example 8: Non-React usage - Pure JavaScript/TypeScript
const NonReactUsageExample: React.FC = () => {
  const [counter] = useGlobalState('non-react-counter', 0);
  const [logs, setLogs] = useState<string[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to state changes
    unsubscribeRef.current = subscribeGlobalState<number>(
      'non-react-counter',
      (newValue, prevValue) => {
        const log = `Counter changed: ${prevValue} → ${newValue}`;
        setLogs((prev) => [...prev, log]);
      }
    );

    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  // Simulate non-React code updating the state
  const simulateServiceCall = () => {
    // This could be in any utility function, service, or event handler
    setTimeout(() => {
      const current = getGlobalState<number>('non-react-counter') || 0;
      setGlobalState('non-react-counter', current + 1);
    }, 100);
  };

  const simulateMultipleUpdates = () => {
    // Simulate rapid updates from external source
    let count = 0;
    const interval = setInterval(() => {
      setGlobalState('non-react-counter', (prev: number) => prev + 1);
      count++;
      if (count >= 5) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleReset = () => {
    resetGlobalState('non-react-counter');
    setLogs([]);
  };

  return (
    <Card
      title="Non-React Usage (Pure JS/TS)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🔧 Use in utility functions, services, event handlers, timers, etc.
        </Text>
        <Divider />
        <div>
          <Text strong>Current Counter: </Text>
          <Text style={{ fontSize: 18, color: '#1890ff' }}>{counter}</Text>
        </div>
        <Space>
          <Button type="primary" onClick={simulateServiceCall}>
            Simulate Service Call (+1)
          </Button>
          <Button onClick={simulateMultipleUpdates}>
            Simulate Rapid Updates (+5)
          </Button>
          <Button danger onClick={handleReset}>
            Reset & Clear Logs
          </Button>
        </Space>
        <Divider />
        <div>
          <Text strong>Change Logs:</Text>
          <div
            style={{
              maxHeight: 150,
              overflowY: 'auto',
              background: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
              marginTop: 8,
            }}
          >
            {logs.length === 0 ? (
              <Text type="secondary">No changes yet...</Text>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{ fontSize: 12, fontFamily: 'monospace' }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Code example:
        </Text>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {`// In any utility or service file
import { getGlobalState, setGlobalState } from 'zustand-kit';

// Get current value
const count = getGlobalState<number>('counter');

// Update value
setGlobalState('counter', count + 1);

// Subscribe to changes
const unsubscribe = subscribeGlobalState('counter', (newVal, prevVal) => {
  console.log('Changed:', prevVal, '->', newVal);
});`}
        </pre>
      </Space>
    </Card>
  );
};

// Example 9: Display state from non-React updates
const NonReactStateDisplay: React.FC = () => {
  const [counter] = useGlobalState('non-react-counter', 0);

  return (
    <Card
      title="React Component (Auto Synced)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🔄 This component automatically updates when non-React code modifies
          the state
        </Text>
        <Divider />
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1890ff' }}>
            {counter}
          </Text>
        </div>
        <Text type="secondary" style={{ textAlign: 'center' }}>
          Counter value synchronized from non-React code
        </Text>
      </Space>
    </Card>
  );
};

// Example 10: Shallow Comparison for Selector
let renderCountEqualityFn = 0;
const UserSelectorWithEqualityFn: React.FC = () => {
  renderCountEqualityFn++;
  // Use shallow comparison mode - only re-render if name or email changes
  const userInfo = useGlobalSelector(
    'user',
    (state: { name: string; email: string; age: number }) => ({
      name: state.name,
      email: state.email,
    }),
    'shallow' // Use built-in shallow comparison
  );

  return (
    <Card title="Component D" className="use-global-state-example__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge
          count={renderCountEqualityFn}
          style={{ backgroundColor: '#722ed1' }}
        >
          <Text strong>Render Count</Text>
        </Badge>
        <div style={{ marginTop: 12 }}>
          <Text strong>Name: </Text>
          <Text style={{ fontSize: 16, color: '#1890ff' }}>
            {userInfo.name}
          </Text>
        </div>
        <div>
          <Text strong>Email: </Text>
          <Text style={{ fontSize: 16, color: '#52c41a' }}>
            {userInfo.email}
          </Text>
        </div>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Uses built-in shallow comparison (useShallow)
          <br />
          Try changing age in Component A - this won't re-render!
          <br />
          Only re-renders when name or email changes.
        </Text>
      </Space>
    </Card>
  );
};

// Example 11: DevTools Integration
const DevToolsExample: React.FC = () => {
  const [debugData, setDebugData] = useGlobalState(
    'debug-data',
    {
      counter: 0,
      clicks: [] as number[],
      lastAction: 'none',
    },
    {
      enableDevtools: true, // Explicitly enable (auto-enabled in dev mode)
    }
  );

  const handleIncrement = () => {
    setDebugData({
      counter: debugData.counter + 1,
      clicks: [...debugData.clicks, Date.now()],
      lastAction: 'increment',
    });
  };

  const handleReset = () => {
    setDebugData({
      counter: 0,
      clicks: [],
      lastAction: 'reset',
    });
  };

  return (
    <Card
      title="Redux DevTools Integration"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🔍 Open Redux DevTools to see state changes in real-time
          <br />
          State name: <Text code>GlobalState:debug-data</Text>
        </Text>
        <Divider />
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#722ed1' }}>
            {debugData.counter}
          </Text>
        </div>
        <div>
          <Text strong>Last Action: </Text>
          <Text type={debugData.lastAction === 'reset' ? 'danger' : undefined}>
            {debugData.lastAction}
          </Text>
        </div>
        <div>
          <Text strong>Click History: </Text>
          <Text type="secondary">{debugData.clicks.length} clicks</Text>
        </div>
        <Space style={{ marginTop: 12 }}>
          <Button type="primary" onClick={handleIncrement}>
            Increment
          </Button>
          <Button danger onClick={handleReset}>
            Reset
          </Button>
        </Space>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 DevTools Features:
          <br />• Time-travel debugging
          <br />• Action history
          <br />• State diff view
          <br />• Auto-enabled in development
        </Text>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          📝 Configuration:
        </Text>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 8,
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          {`// Auto-enabled in dev (default)
useGlobalState('key', initialState);

// Explicitly enable
useGlobalState('key', initialState, {
  enableDevtools: true
});

// Disable in dev
useGlobalState('key', initialState, {
  enableDevtools: false
});`}
        </pre>
      </Space>
    </Card>
  );
};

const Example: React.FC = () => {
  const [showOptimized, setShowOptimized] = useState(true);

  return (
    <div className="use-global-state-example">
      <Title level={2}>基于 Zustand 的全局状态共享</Title>

      <Title level={3}>1. Simple Value - useGlobalState</Title>
      <Paragraph>
        <Text code>
          const [count, setCount, resetCount] = useGlobalState('counter', 0)
        </Text>{' '}
        - 适用于简单值类型
      </Paragraph>
      <div className="use-global-state-example__row">
        <CounterComponentA />
        <CounterComponentB />
        {showOptimized && <CounterButtons />}
      </div>
      <Collapse
        items={[{
          key: '1',
          label: '查看代码示例',
          children: (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                margin: 0,
                overflow: 'auto',
              }}
            >
              {`const [count, setCount, resetCount] = useGlobalState('counter', 0);

// 直接赋值
setCount(5);

// 函数式更新
setCount(prev => prev + 1);

// 重置到初始值
resetCount();`}
            </pre>
          )
        }]}
        style={{ marginTop: 16 }}
      />

      <Divider style={{ margin: '32px 0' }} />

      <Title level={3}>2. Object State - useGlobalState</Title>
      <Paragraph>
        <Text code>
          const [user, setUser, resetUser] = useGlobalState('user', {'{ }'})
        </Text>{' '}
        - 支持对象类型和部分更新
      </Paragraph>
      <div className="use-global-state-example__row">
        <UserComponentA />
        <UserComponentB />
      </div>
      <Collapse
        items={[{
          key: '1',
          label: '查看代码示例',
          children: (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                margin: 0,
                overflow: 'auto',
              }}
            >
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
          )
        }]}
        style={{ marginTop: 16 }}
      />

      <Divider style={{ margin: '32px 0' }} />

      <Title level={3}>3. Performance Optimization (auto detection)</Title>
      <Paragraph>
        <Text strong>优化重渲染：</Text>使用 <Text code>useGlobalSelector</Text>{' '}
        和 <Text code>useGlobalSetter</Text>{' '}
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
        </div>
      )}
      {showOptimized && (
        <Collapse
          items={[{
            key: '1',
            label: '查看代码示例',
            children: (
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  fontSize: 12,
                  margin: 0,
                  overflow: 'auto',
                }}
              >
                {`// useGlobalSelector - 细粒度订阅
const userName = useGlobalSelector('user', state => state.name);
// 只有 name 变化时才重渲染

// 自动浅比较 - 对象返回值
const userInfo = useGlobalSelector('user', state => ({
  name: state.name,
  email: state.email
}));
// 自动检测对象类型并使用浅比较

// useGlobalSetter - 只写模式
const setCount = useGlobalSetter<number>('counter');
setCount(prev => prev + 1);
// 此组件不会因为 count 变化而重渲染`}
              </pre>
            )
          }]}
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
        items={[{
          key: '1',
          label: '查看代码示例',
          children: (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                margin: 0,
                overflow: 'auto',
              }}
            >
              {`// 开发环境自动启用 DevTools（默认）
const [data, setData] = useGlobalState('data', { count: 0 });

// 禁用 DevTools
const [privateData, setPrivateData] = useGlobalState('private', {}, {
  enableDevtools: false
});

// 强制启用 DevTools（生产环境）
const [debugData, setDebugData] = useGlobalState('debug', {}, {
  enableDevtools: true
});

// 在 Redux DevTools 中显示为: GlobalState:data`}
            </pre>
          )
        }]}
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
        items={[{
          key: '1',
          label: '查看代码示例',
          children: (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                margin: 0,
                overflow: 'auto',
              }}
            >
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
          )
        }]}
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
        items={[{
          key: '1',
          label: '查看代码示例',
          children: (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                margin: 0,
                overflow: 'auto',
              }}
            >
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
          )
        }]}
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
  );
};

export default Example;

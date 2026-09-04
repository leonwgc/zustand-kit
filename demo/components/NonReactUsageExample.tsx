import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import {
  useGlobalState,
  getGlobalState,
  setGlobalState,
  subscribeGlobalState,
  resetGlobalState,
} from '../../src/index';

const { Text } = Typography;

const NonReactUsageExample: React.FC = () => {
  const [counter] = useGlobalState('non-react-counter', 0);
  const [logs, setLogs] = useState<string[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
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

  const simulateServiceCall = () => {
    setTimeout(() => {
      const current = getGlobalState<number>('non-react-counter') || 0;
      setGlobalState('non-react-counter', current + 1);
    }, 100);
  };

  const simulateMultipleUpdates = () => {
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
          {`// 1. Initialize at app entry (before React renders)
import { initGlobalState, getGlobalState, setGlobalState } from 'zustand-kit';

initGlobalState('counter', 0);

// 2. Use anywhere in non-React code
const count = getGlobalState<number>('counter');

// Direct / functional / partial update
setGlobalState('counter', count + 1);
setGlobalState('counter', prev => prev + 1);

// Subscribe (remember to unsubscribe to avoid memory leaks)
const unsubscribe = subscribeGlobalState('counter', (newVal, prevVal) => {
  console.log('Changed:', prevVal, '->', newVal);
});
// Later: unsubscribe();`}
        </pre>
      </Space>
    </Card>
  );
};

export default NonReactUsageExample;

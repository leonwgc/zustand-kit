import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalState, configureDevtools } from '../../src/index';

const { Text } = Typography;

type DebugData = {
  counter: number;
  clicks: number[];
  lastAction: string;
};

const initialDebugData: DebugData = {
  counter: 0,
  clicks: [],
  lastAction: 'none',
};

const DevToolsExample: React.FC = () => {
  const [devtoolsOn, setDevtoolsOn] = useState(
    process.env.NODE_ENV !== 'production'
  );
  const [debugData, setDebugData] = useGlobalState<DebugData>(
    'debug-data',
    initialDebugData
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

  const toggleDevtools = () => {
    const next = !devtoolsOn;
    configureDevtools(next);
    setDevtoolsOn(next);
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
          State name: <Text code>GlobalStates (All)</Text>
        </Text>
        <Divider />
        <Space>
          <Text strong>DevTools:</Text>
          <Badge
            status={devtoolsOn ? 'success' : 'default'}
            text={devtoolsOn ? 'Enabled' : 'Disabled'}
          />
          <Button size="small" onClick={toggleDevtools}>
            {devtoolsOn ? 'Disable' : 'Enable'}
          </Button>
        </Space>
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

// Globally disable DevTools at app entry
import { configureDevtools } from 'zustand-kit';
configureDevtools(false);

// Globally enable DevTools (e.g., for production debugging)
configureDevtools(true);`}
        </pre>
      </Space>
    </Card>
  );
};

export default DevToolsExample;

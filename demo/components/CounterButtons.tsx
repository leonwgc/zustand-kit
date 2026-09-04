import React from 'react';
import { Card, Button, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalSetter } from '../../src/index';

const { Text } = Typography;

let renderCount = 0;

const CounterButtons: React.FC = () => {
  renderCount++;
  const setCount = useGlobalSetter<number>('counter');

  return (
    <Card
      title="Component C - Setter Only"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCount} style={{ backgroundColor: '#52c41a' }}>
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
          💡 This component only updates state, doesn&apos;t read it.
          <br />
          Check Component A/B - it won&apos;t re-render when count changes!
        </Text>
      </Space>
    </Card>
  );
};

export default CounterButtons;

import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useGlobalState } from '../../src/index';

const { Text } = Typography;

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

export default CounterComponentA;

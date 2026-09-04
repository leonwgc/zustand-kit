import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useGlobalState } from '../../src/index';

const { Text } = Typography;

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

export default CounterComponentB;

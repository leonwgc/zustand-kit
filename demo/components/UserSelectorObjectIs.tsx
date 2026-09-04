import React from 'react';
import { Card, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalSelector } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

let renderCount = 0;

const UserSelectorObjectIs: React.FC = () => {
  renderCount++;

  // Object.is only works safely with stable references (primitives).
  const userAge = useGlobalSelector<User, number>(
    'user',
    (state) => state.age,
    false
  );

  return (
    <Card
      title="Component F - equalityMode: false (Object.is)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCount} style={{ backgroundColor: '#eb2f96' }}>
          <Text strong>Render Count</Text>
        </Badge>
        <div style={{ marginTop: 12 }}>
          <Text strong>Age: </Text>
          <Text style={{ fontSize: 18, color: '#eb2f96' }}>{userAge}</Text>
        </div>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Forces <Text code>Object.is</Text> — only re-renders when age
          actually changes. Use with primitives / stable references.
        </Text>
      </Space>
    </Card>
  );
};

export default UserSelectorObjectIs;

import React from 'react';
import { Card, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalSelector } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

let renderCount = 0;

const UserSelectorExplicitShallow: React.FC = () => {
  renderCount++;

  const userInfo = useGlobalSelector<User, { name: string; email: string }>(
    'user',
    (state) => ({ name: state.name, email: state.email }),
    'shallow'
  );

  return (
    <Card
      title="Component E - equalityMode: 'shallow'"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCount} style={{ backgroundColor: '#13c2c2' }}>
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
          💡 Explicitly forces shallow comparison — same behavior as auto mode
          for object returns, but makes intent visible in code.
        </Text>
      </Space>
    </Card>
  );
};

export default UserSelectorExplicitShallow;

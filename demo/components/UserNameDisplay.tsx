import React from 'react';
import { Card, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalSelector } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

let renderCount = 0;

const UserNameDisplay: React.FC = () => {
  renderCount++;
  const userName = useGlobalSelector<User, string>(
    'user',
    (state) => state.name
  );

  return (
    <Card
      title="Component C - Optimized Selector"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCount} style={{ backgroundColor: '#52c41a' }}>
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
          💡 This component only subscribes to the &quot;name&quot; field.
          <br />
          Try changing email or age in Component A - this won&apos;t re-render!
        </Text>
      </Space>
    </Card>
  );
};

export default UserNameDisplay;

import React from 'react';
import { Card, Space, Typography, Divider, Badge } from 'antd';
import { useGlobalSelector } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

let renderCount = 0;

const DerivedSelector: React.FC = () => {
  renderCount++;

  // Selector returns a derived boolean — component only re-renders when the
  // boolean flips, not on every age change.
  const isAdult = useGlobalSelector<User, boolean>(
    'user',
    (state) => state.age >= 18
  );

  return (
    <Card
      title="Component G - Derived Selector"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Badge count={renderCount} style={{ backgroundColor: '#fa8c16' }}>
          <Text strong>Render Count</Text>
        </Badge>
        <div style={{ marginTop: 12 }}>
          <Text strong>Is Adult (age ≥ 18): </Text>
          <Text
            style={{
              fontSize: 18,
              color: isAdult ? '#52c41a' : '#f5222d',
            }}
          >
            {isAdult ? 'Yes ✅' : 'No ❌'}
          </Text>
        </div>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Age changes 20 → 25 won&apos;t re-render — only crossing the
          threshold triggers an update.
        </Text>
      </Space>
    </Card>
  );
};

export default DerivedSelector;

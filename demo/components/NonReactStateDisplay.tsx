import React from 'react';
import { Card, Space, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';

const { Text } = Typography;

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

export default NonReactStateDisplay;

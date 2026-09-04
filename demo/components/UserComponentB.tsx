import React from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

const initialUser: User = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
};

const UserComponentB: React.FC = () => {
  const [user, setUser, resetUser] = useGlobalState('user', initialUser);

  return (
    <Card
      title="Component B - Display & Actions"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="use-global-state-example__profile">
          <div className="use-global-state-example__avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div>
              <Text strong style={{ fontSize: 18 }}>
                {user.name}
              </Text>
            </div>
            <div>
              <Text type="secondary">{user.email}</Text>
            </div>
            <div>
              <Text>Age: {user.age}</Text>
            </div>
          </div>
        </div>
        <Divider />
        <Space>
          <Button type="primary" onClick={() => setUser({ age: user.age + 1 })}>
            Birthday 🎂
          </Button>
          <Button onClick={resetUser}>Reset Profile</Button>
        </Space>
      </Space>
    </Card>
  );
};

export default UserComponentB;

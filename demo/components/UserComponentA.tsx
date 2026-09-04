import React from 'react';
import { Card, Space, Input, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';
import type { User } from '../types';

const { Text } = Typography;

const initialUser: User = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
};

const UserComponentA: React.FC = () => {
  const [user, setUser] = useGlobalState('user', initialUser);

  return (
    <Card
      title="Component A - User Profile"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Name:</Text> {user.name}
        </div>
        <div>
          <Text strong>Email:</Text> {user.email}
        </div>
        <div>
          <Text strong>Age:</Text> {user.age}
        </div>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Name"
            value={user.name}
            onChange={(e) => setUser({ name: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ email: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Age"
            value={user.age}
            onChange={(e) => setUser({ age: Number(e.target.value) })}
          />
        </Space>
      </Space>
    </Card>
  );
};

export default UserComponentA;

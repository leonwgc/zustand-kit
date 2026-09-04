import React from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';

const { Text } = Typography;

type SessionInfo = {
  visitCount: number;
  lastVisit: string;
  tabId: string;
};

const SessionData: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useGlobalState<SessionInfo>(
    'session-info',
    {
      visitCount: 0,
      lastVisit: new Date().toISOString(),
      tabId: Math.random().toString(36).substring(7),
    },
    { storage: 'sessionStorage' }
  );

  return (
    <Card
      title="Session Data (sessionStorage)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🕐 This data persists only during the browser session
        </Text>
        <Divider />
        <div>
          <Text strong>Visit Count: </Text>
          <Text style={{ fontSize: 18, color: '#1890ff' }}>
            {sessionInfo.visitCount}
          </Text>
        </div>
        <div>
          <Text strong>Tab ID: </Text>
          <Text code>{sessionInfo.tabId}</Text>
        </div>
        <div>
          <Text strong>Last Visit: </Text>
          <Text type="secondary">
            {new Date(sessionInfo.lastVisit).toLocaleString()}
          </Text>
        </div>
        <Space style={{ marginTop: 12 }}>
          <Button
            type="primary"
            onClick={() =>
              setSessionInfo({
                visitCount: sessionInfo.visitCount + 1,
                lastVisit: new Date().toISOString(),
              })
            }
          >
            Record Visit
          </Button>
          <Button
            onClick={() =>
              setSessionInfo({
                visitCount: 0,
                lastVisit: new Date().toISOString(),
                tabId: Math.random().toString(36).substring(7),
              })
            }
          >
            Reset Session
          </Button>
        </Space>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Try refreshing the page - data persists!
          <br />
          Close the tab and reopen - data will be reset.
        </Text>
      </Space>
    </Card>
  );
};

export default SessionData;
